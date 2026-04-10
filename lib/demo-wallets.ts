export type DemoProfileKey = "admin" | "investorA" | "investorB" | "investorC"

export interface DemoWalletConfig {
  key: DemoProfileKey
  label: string
  address: string
  shouldBeWhitelisted: boolean
  expectedRoles: string[]
}

export const DEMO_WALLETS: Record<DemoProfileKey, DemoWalletConfig> = {
  admin: {
    key: "admin",
    label: "Admin Wallet",
    address: process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "",
    shouldBeWhitelisted: true,
    expectedRoles: ["DEFAULT_ADMIN_ROLE", "OPERATOR_ROLE", "COMPLIANCE_ROLE", "ORACLE_ROLE"],
  },
  investorA: {
    key: "investorA",
    label: "Investor A",
    address: "0x1111111111111111111111111111111111111111", // replace
    shouldBeWhitelisted: true,
    expectedRoles: [],
  },
  investorB: {
    key: "investorB",
    label: "Investor B",
    address: "0x2222222222222222222222222222222222222222", // replace
    shouldBeWhitelisted: true,
    expectedRoles: [],
  },
  investorC: {
    key: "investorC",
    label: "Investor C (Blocked Test)",
    address: "0x3333333333333333333333333333333333333333", // replace
    shouldBeWhitelisted: false,
    expectedRoles: [],
  },
}

export const DEMO_WALLET_LIST = Object.values(DEMO_WALLETS)

export function findDemoWalletByAddress(address?: string | null) {
  if (!address) return null
  return (
    DEMO_WALLET_LIST.find(
      (wallet) => wallet.address.toLowerCase() === address.toLowerCase()
    ) ?? null
  )
}