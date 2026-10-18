"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail } from "../services/verify-email.service"

type VerifyStatus = "loading" | "success" | "error"

const REDIRECT_SECONDS = 5

export function useVerifyEmail(token: string | null) {
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>(() => (token ? "loading" : "error"))
  const [message, setMessage] = useState(() =>
    token
      ? ""
      : "No verification token provided. Please check the link in your email."
  )
  const [userEmail, setUserEmail] = useState("")
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(true)
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!token) {
      return
    }

    verifyEmail(token)
      .then((data) => {
        setUserEmail(data.email)
        setRequiresPasswordChange(data.requiresPasswordChange)
        setStatus("success")
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: string; errors?: string[] } } }
        const errorMsg =
          axiosErr?.response?.data?.message ??
          axiosErr?.response?.data?.errors?.[0] ??
          "Verification failed. The link may have expired or already been used."
        setMessage(errorMsg)
        setStatus("error")
      })
  }, [token])

  useEffect(() => {
    if (status !== "success") return

    const redirectPath = requiresPasswordChange
      ? "/change-password?source=verification"
      : "/dashboard"

    redirectedRef.current = false

    const tick = setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          clearInterval(tick)
          if (!redirectedRef.current) {
            redirectedRef.current = true
            router.push(redirectPath)
          }
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [status, router, requiresPasswordChange])

  return { status, message, userEmail, requiresPasswordChange, countdown }
}
