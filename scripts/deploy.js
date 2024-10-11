const { ethers, run } = require("hardhat");

async function main() {
  const easAddressForBaseSepolia = "0x4200000000000000000000000000000000000021";

  // POCP
  const pocpContract = await hre.ethers.getContractFactory("POCP");
  console.log("Deploying POCP Contract...");
  const pocp = await pocpContract.deploy(
    easAddressForBaseSepolia,
    {
      gasPrice: 33000000000,
    }
  );
  await pocp.waitForDeployment();
  const pocpAddress = await pocp.getAddress();
  console.log("POCP Contract Address:", pocpAddress);
  console.log("----------------------------------------------------------");

  // Verify POCP
  console.log("Verifying POCP...");
  await run("verify:verify", {
    address: pocpAddress,
    constructorArguments: [easAddressForBaseSepolia],
  });
  console.log("----------------------------------------------------------");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// yarn hardhat run scripts/deploy.js --network baseSepolia
// yarn hardhat verify --network baseSepolia 0x9FA0Fc7360f19546101c3A3794C42363C5e1c335 "0x4200000000000000000000000000000000000021"