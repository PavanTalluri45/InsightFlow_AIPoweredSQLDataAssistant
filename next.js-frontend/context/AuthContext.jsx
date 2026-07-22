"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Only swaps the `user` object in state when the underlying user id
    // actually changes. Supabase re-emits onAuthStateChange (e.g. on tab
    // visibility/focus, token refresh) with a freshly deserialized user
    // object even when it's the same signed-in user — without this guard,
    // every consumer of `user` across the app (via useEffect/useCallback
    // deps) would re-run unnecessarily on every tab refocus.
    const applyUser = (nextUser) => {
        setUser((prevUser) => {
            if (prevUser?.id === (nextUser?.id ?? null)) {
                return prevUser;
            }
            return nextUser ?? null;
        });
    };

    useEffect(() => {
        const getInitialUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            applyUser(user);
            setLoading(false);
        };

        getInitialUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            applyUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);


    const login = async ({ email, password }) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signup = async ({ email, password, fullName }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: { full_name: fullName },
            },
        });

        if (error) return { data, error };

        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
            return {
                data,
                error: { message: "already registered" },
            };
        }

        return { data, error: null };
    };

    const loginWithGoogle = async () => {
        return supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const requestPasswordReset = async (email) => {
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    };

    const updatePassword = async (newPassword) => {
        return supabase.auth.updateUser({ password: newPassword });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                loginWithGoogle,
                logout,
                requestPasswordReset,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}