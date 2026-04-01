export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111), // Sepolia default
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://sepolia.etherscan.io",
  networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia",
}