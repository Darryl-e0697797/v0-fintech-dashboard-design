import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;

  const Token = await ethers.getContractFactory("GCOREToken");
  const token = await Token.deploy(admin);

  await token.waitForDeployment();

  console.log("Deployer:", deployer.address);
  console.log("Admin:", admin);
  console.log("GCORE deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});