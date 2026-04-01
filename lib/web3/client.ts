import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers"
import { GCORE_ABI } from "./abi"
import { CONTRACT_CONFIG } from "./contract"

declare global {
  interface Window {
    ethereum?: any
  }
}

export async function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected")
  }
  return new BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = await getBrowserProvider()
  return provider.getSigner()
}

export async function getContractWithSigner() {
  const signer = await getSigner()
  return new Contract(CONTRACT_CONFIG.address, GCORE_ABI, signer)
}

export async function getContractReadOnly() {
  const provider = await getBrowserProvider()
  return new Contract(CONTRACT_CONFIG.address, GCORE_ABI, provider)
}

export function toTokenUnits(value: string) {
  return parseUnits(value || "0", 18)
}

export function fromTokenUnits(value: bigint) {
  return formatUnits(value, 18)
}