"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { forgotPasswordSchema } from "@/lib/validations"
import { mapAuthError } from "@/lib/auth-errors"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false)
    const { requestPasswordReset } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async ({ email }) => {
        const checkRes = await fetch("/api/auth/check-reset-eligibility", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })

        if (!checkRes.ok) {
            toast.error("Something went wrong. Please try again.")
            return
        }

        const { status } = await checkRes.json()

        if (status === "not_found") {
            toast.error("No account found with that email address.")
            return
        }

        if (status === "oauth_only") {
            toast.error(
                "This account signed up with Google and doesn't have a password. Log in with Google instead."
            )
            return
        }

        const { error } = await requestPasswordReset(email)

        if (error) {
            toast.error(mapAuthError(error))
            return
        }

        setSent(true)
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle>Reset your password</CardTitle>
                        <CardDescription>
                            {sent
                                ? "Check your inbox for a link to reset your password."
                                : "Enter your email and we'll send you a reset link."}
                        </CardDescription>
                    </CardHeader>
                    {!sent && (
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <FieldGroup className="gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            {...register("email")}
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email.message}</p>
                                        )}
                                    </Field>
                                    <Field>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Spinner />}
                                            {isSubmitting ? "Sending" : "Send reset link"}
                                        </Button>
                                        <FieldDescription className="text-center">
                                            Remembered your password? <a href="/login">Log in</a>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    )
}