"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "reset">(token ? "reset" : "email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setStatus("loading")

    try {
      if (step === "email") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          setStatus("success")
        } else {
          const data = await res.json()
          setError(data.error || "Something went wrong")
          setStatus("error")
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setStatus("error")
          return
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters")
          setStatus("error")
          return
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        })
        if (res.ok) {
          setStatus("success")
        } else {
          const data = await res.json()
          setError(data.error || "Something went wrong")
          setStatus("error")
        }
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  if (step === "reset" && status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Password Reset Successful</CardTitle>
          <CardDescription>Your password has been updated. You can now sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{step === "email" ? "Forgot Password" : "Reset Password"}</CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email and we'll send you a reset link"
            : "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "success" && step === "email" && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
              If the email exists, a reset link has been sent.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
            </div>
          )}

          {step === "reset" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" loading={status === "loading"}>
            {step === "email" ? "Send Reset Link" : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}