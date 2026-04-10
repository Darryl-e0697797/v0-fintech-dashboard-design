import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_AUTH_COOKIE, DEMO_PROFILE_COOKIE } from "@/lib/demo-session"

async function loginAction(formData: FormData) {
  "use server"

  const password = String(formData.get("password") ?? "")
  const profile = String(formData.get("profile") ?? "admin")
  const nextPath = String(formData.get("next") ?? "/")

  if (password !== process.env.DEMO_PASSWORD) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`)
  }

  if (!["admin", "investorA", "investorB", "investorC"].includes(profile)) {
    redirect(`/login?error=1&next=${encodeURIComponent(nextPath)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(DEMO_AUTH_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    secure: false,
    httpOnly: false,
  })
  cookieStore.set(DEMO_PROFILE_COOKIE, profile, {
    path: "/",
    sameSite: "lax",
    secure: false,
    httpOnly: false,
  })

  redirect(nextPath || "/")
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const hasError = params?.error === "1"
  const nextPath = params?.next || "/"

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">GCORE Demo Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password-protected demo access for the tokenized ETF dashboard.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <div className="space-y-2">
            <label htmlFor="profile" className="text-sm font-medium text-foreground">
              Demo profile
            </label>
            <select
              id="profile"
              name="profile"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              defaultValue="admin"
            >
              <option value="admin">Admin</option>
              <option value="investorA">Investor A</option>
              <option value="investorB">Investor B</option>
              <option value="investorC">Investor C (Blocked Test)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Enter demo password"
              required
            />
          </div>

          {hasError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Invalid password.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Enter dashboard
          </button>
        </form>
      </div>
    </main>
  )
}