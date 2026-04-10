import type { DemoProfileKey } from "@/lib/demo-wallets"

export const DEMO_AUTH_COOKIE = "gcore_demo_auth"
export const DEMO_PROFILE_COOKIE = "gcore_demo_profile"

export function isAdminProfile(profile?: string | null): boolean {
  return profile === "admin"
}

export function getDemoProfileFromDocumentCookie(): DemoProfileKey {
  if (typeof document === "undefined") return "admin"

  const cookies = document.cookie.split(";").map((c) => c.trim())
  const raw = cookies.find((c) => c.startsWith(`${DEMO_PROFILE_COOKIE}=`))
  const value = raw?.split("=")[1]

  if (value === "admin" || value === "investorA" || value === "investorB" || value === "investorC") {
    return value
  }

  return "admin"
}

export function clearDemoSessionCookies() {
  if (typeof document === "undefined") return
  document.cookie = `${DEMO_AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  document.cookie = `${DEMO_PROFILE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}