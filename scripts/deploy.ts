import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("GCOREToken");
  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("GCORE deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});