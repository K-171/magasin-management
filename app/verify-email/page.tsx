"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState("")
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error")
        setError("Invalid verification link")
        return
      }

      try {
        const result = await verifyEmail(token)
        if (result.success) {
          setStatus("success")
        } else {
          setStatus("error")
          setError(result.error || "Verification failed")
        }
      } catch (err) {
        setStatus("error")
        setError("An unexpected error occurred")
      }
    }

    verify()
  }, [token, verifyEmail])

  const handleResendVerification = async () => {
    setIsResending(true)
    // This would need the user's email - in a real app, you might get this from the token
    // For now, we'll show a message to contact support
    setTimeout(() => {
      setIsResending(false)
      alert("Please contact support to resend verification email")
    }, 1000)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2b4198] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="mt-4">Email verified successfully!</CardTitle>
              <CardDescription>Your email has been verified. You can now log in to your account.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button className="w-full bg-[#2b4198] hover:bg-[#1e2f7a]">Continue to login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4">Verification failed</CardTitle>
            <CardDescription>We couldn't verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full bg-transparent"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
