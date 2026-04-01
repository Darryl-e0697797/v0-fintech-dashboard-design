export const GCORE_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function owner() view returns (address)",
  "function whitelist(address user) view returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function setWhitelist(address user, bool status)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Whitelisted(address indexed user, bool status)",
]