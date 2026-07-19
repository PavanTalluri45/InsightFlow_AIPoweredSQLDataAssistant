export function mapAuthError(error) {
    if (!error) return "Something went wrong. Please try again.";

    const msg = (error.message || "").toLowerCase();
    const status = error.status;

    if (status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
        return "Too many requests. Please wait a bit before trying again.";
    }
    if (msg.includes("invalid login credentials")) {
        return "Invalid email or password. Please try again.";
    }
    if (msg.includes("email not confirmed")) {
        return "Please confirm your email address before logging in.";
    }
    if (msg.includes("already registered") || msg.includes("user already exists")) {
        return "An account with this email already exists. Please log in instead.";
    }
    if (msg.includes("password should be at least")) {
        return "Your password doesn't meet the minimum requirements.";
    }
    if (msg.includes("network") || error.name === "AuthRetryableFetchError") {
        return "A network error occurred. Please check your connection and try again.";
    }
    if (msg.includes("session") && msg.includes("expired")) {
        return "Your session has expired. Please log in again.";
    }

    return "Something went wrong. Please try again.";
}

// Shown when a Google sign-in is rejected because the email already
// belongs to a password-based account (see auth/callback/route.js).
export const GOOGLE_ACCOUNT_EXISTS_MESSAGE =
    "This email is already associated with a password account. Please sign in with your password first — you can link Google from your account settings afterward.";