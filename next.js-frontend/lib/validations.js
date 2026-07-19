import { z } from "zod";


const passwordRules = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter");

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .toLowerCase()
        .trim(),
    // Intentionally not re-checking complexity on login — only that something
    // was typed. The real check happens server-side against the stored hash.
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must be at most 50 characters")
        .regex(
            /^[A-Za-z\s'-]+$/,
            "Full name can only contain letters, spaces, hyphens, and apostrophes"
        ),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .toLowerCase()
        .trim(),
    password: passwordRules,
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .toLowerCase()
        .trim(),
});


export const resetPasswordSchema = z
    .object({
        password: passwordRules,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });