export type SavedWalletRoleTag =
  | "DEFAULT_ADMIN_ROLE"
  | "OPERATOR_ROLE"
  | "COMPLIANCE_ROLE"
  | "ORACLE_ROLE"
  | "INVESTOR"
  | "UNAPPROVED"
  | "OTHER"

export interface SavedWalletEntry {
  address: string
  label: string
  notes?: string
  intendedRole?: SavedWalletRoleTag
}

const STORAGE_KEY = "gcore_saved_wallets"

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

export function getSavedWallets(): SavedWalletEntry[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        item &&
        typeof item.address === "string" &&
        typeof item.label === "string"
    )
  } catch {
    return []
  }
}

export function saveWallet(entry: SavedWalletEntry): SavedWalletEntry[] {
  if (typeof window === "undefined") return []

  const existing = getSavedWallets()
  const normalized = normalizeAddress(entry.address)

  const updated = [
    ...existing.filter((item) => normalizeAddress(item.address) !== normalized),
    {
      address: entry.address.trim(),
      label: entry.label.trim(),
      notes: entry.notes?.trim() || "",
      intendedRole: entry.intendedRole || "OTHER",
    },
  ]

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function removeSavedWallet(address: string): SavedWalletEntry[] {
  if (typeof window === "undefined") return []

  const normalized = normalizeAddress(address)
  const updated = getSavedWallets().filter(
    (item) => normalizeAddress(item.address) !== normalized
  )

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function findSavedWallet(address: string): SavedWalletEntry | null {
  const normalized = normalizeAddress(address)

  return (
    getSavedWallets().find(
      (item) => normalizeAddress(item.address) === normalized
    ) || null
  )
}