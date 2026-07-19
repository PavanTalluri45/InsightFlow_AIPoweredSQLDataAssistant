"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Eye, EyeOff, X } from "lucide-react"
import { signupSchema } from "@/lib/validations"
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
  FieldSeparator,
} from "@/components/ui/field"
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

export function SignupForm({
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { signup, loginWithGoogle } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const passwordField = register("password")
  const strength = getPasswordStrength(password)

  const onSubmit = async (formData) => {
    const { error } = await signup(formData)

    if (error) {
      toast.error(mapAuthError(error))
      return
    }

    toast.success(
      "Account created successfully. Please check your email and verify your account before logging in."
    )
    router.push("/login")
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    const { error } = await loginWithGoogle()
    if (error) {
      toast.error(mapAuthError(error))
      setIsGoogleLoading(false)
    }
  }

  const busy = isSubmitting || isGoogleLoading

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register("fullName")}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </Field>
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Enter your password"
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
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
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
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={busy}>
                  {isSubmitting && <Spinner />}
                  {isSubmitting ? "Creating Account" : "Create Account"}
                </Button>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Button
                  variant="outline"
                  type="button"
                  disabled={busy}
                  onClick={handleGoogleSignup}
                >
                  {isGoogleLoading ? (
                    <Spinner />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4182 3.52 9.52727H0.858182V11.5927C2.17455 14.2036 4.87273 16 8 16Z"
                        fill="#34A853"
                      />
                      <path
                        d="M3.52 9.52C3.36 9.04 3.26545 8.53091 3.26545 8C3.26545 7.46909 3.36 6.96 3.52 6.48V4.41455H0.858182C0.312727 5.49091 0 6.70545 0 8C0 9.29455 0.312727 10.5091 0.858182 11.5855L2.93091 9.97091L3.52 9.52Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M8 3.18545C9.17818 3.18545 10.2255 3.59273 11.0618 4.37818L13.3527 2.08727C11.9636 0.792727 10.16 0 8 0C4.87273 0 2.17455 1.79636 0.858182 4.41455L3.52 6.48C4.15273 4.58909 5.92 3.18545 8 3.18545Z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {isGoogleLoading ? "Redirecting" : "Sign up with Google"}
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}