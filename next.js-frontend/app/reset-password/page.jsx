"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Eye, EyeOff, X } from "lucide-react"
import { resetPasswordSchema } from "@/lib/validations"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const PASSWORD_REQUIREMENTS = [
    { label: "At least 8 characters", test: (value) => value.length >= 8 },
    { label: "At least 1 number", test: (value) => /[0-9]/.test(value) },
    { label: "At least 1 lowercase letter", test: (value) => /[a-z]/.test(value) },
    { label: "At least 1 uppercase letter", test: (value) => /[A-Z]/.test(value) },
]

const STRENGTH_META = [
    { label: "Weak", color: "bg-destructive" },
    { label: "Weak", color: "bg-destructive" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-amber-500" },
    { label: "Strong", color: "bg-emerald-500" },
]

function getPasswordStrength(password) {
    const passed = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length
    return {
        score: passed,
        percent: (passed / PASSWORD_REQUIREMENTS.length) * 100,
        ...STRENGTH_META[passed],
    }
}

function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const router = useRouter()
    const { user, loading, updatePassword } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    })

    const passwordField = register("password")
    const strength = getPasswordStrength(password)

    const onSubmit = async ({ password }) => {
        const { error } = await updatePassword(password)

        if (error) {
            toast.error(mapAuthError(error))
            return
        }

        toast.success("Password updated. Please log in with your new password.")
        router.push("/login")
    }

    if (!loading && !user) {
        return (
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    This reset link is invalid or has expired.{" "}
                    <a href="/forgot-password" className="underline underline-offset-4">
                        Request a new one
                    </a>
                    .
                </p>
            </CardContent>
        )
    }

    return (
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-4">
                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="Enter your new password"
                                type={showPassword ? "text" : "password"}
                                className="pr-9"
                                {...passwordField}
                                onChange={(e) => {
                                    passwordField.onChange(e)
                                    setPassword(e.target.value)
                                }}
                                aria-invalid={!!errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {password.length > 0 && (
                                <motion.div
                                    key="password-strength"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <motion.div
                                                className={`h-full rounded-full ${strength.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${strength.percent}%` }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                            />
                                        </div>

                                        <p className="mt-2 text-sm font-medium text-foreground">
                                            Enter a password. Must contain:
                                        </p>
                                        <ul className="mt-1.5 space-y-1">
                                            {PASSWORD_REQUIREMENTS.map((req, i) => {
                                                const met = req.test(password)
                                                return (
                                                    <motion.li
                                                        key={req.label}
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: i * 0.04 }}
                                                        className={`flex items-center gap-2 text-sm ${met ? "text-emerald-600" : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {met ? (
                                                            <Check className="size-3.5 shrink-0" />
                                                        ) : (
                                                            <X className="size-3.5 shrink-0" />
                                                        )}
                                                        {req.label}
                                                    </motion.li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Retype your new password"
                            {...register("confirmPassword")}
                            aria-invalid={!!errors.confirmPassword}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </Field>
                    <Field>
                        <Button type="submit" disabled={isSubmitting || loading}>
                            {isSubmitting && <Spinner />}
                            {isSubmitting ? "Updating" : "Update password"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </CardContent>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle>Set a new password</CardTitle>
                        <CardDescription>Choose a new password for your account</CardDescription>
                    </CardHeader>
                    <ResetPasswordForm />
                </Card>
            </div>
        </div>
    )
}