import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying contracts with the account:", deployerAddress);

  // 1. Deploy Verification Contract
  const SmartCampusVerify = await ethers.getContractFactory("SmartCampusVerify");
  const smartCampusVerify = await SmartCampusVerify.deploy(deployerAddress);
  await smartCampusVerify.waitForDeployment();
  console.log("SmartCampusVerify deployed to:", await smartCampusVerify.getAddress());

  // 2. Deploy Hiring Contract
  const SmartCampusHiring = await ethers.getContractFactory("SmartCampusHiring");
  const smartCampusHiring = await SmartCampusHiring.deploy(deployerAddress);
  await smartCampusHiring.waitForDeployment();
  console.log("SmartCampusHiring deployed to:", await smartCampusHiring.getAddress());

  // 3. Deploy Finance Contract
  const SmartCampusFinance = await ethers.getContractFactory("SmartCampusFinance");
  const smartCampusFinance = await SmartCampusFinance.deploy(deployerAddress);
  await smartCampusFinance.waitForDeployment();
  console.log("SmartCampusFinance deployed to:", await smartCampusFinance.getAddress());

  // 4. Deploy Admission Contract
  const SmartCampusAdmission = await ethers.getContractFactory("SmartCampusAdmission");
  const smartCampusAdmission = await SmartCampusAdmission.deploy(deployerAddress);
  await smartCampusAdmission.waitForDeployment();
  console.log("SmartCampusAdmission deployed to:", await smartCampusAdmission.getAddress());

  // 5. Deploy Reevaluation Contract
  const SmartCampusReevaluation = await ethers.getContractFactory("SmartCampusReevaluation");
  const smartCampusReevaluation = await SmartCampusReevaluation.deploy(deployerAddress);
  await smartCampusReevaluation.waitForDeployment();
  console.log("SmartCampusReevaluation deployed to:", await smartCampusReevaluation.getAddress());

  // 6. Deploy Library Contract
  const SmartCampusLibrary = await ethers.getContractFactory("SmartCampusLibrary");
  const smartCampusLibrary = await SmartCampusLibrary.deploy(deployerAddress);
  await smartCampusLibrary.waitForDeployment();
  console.log("SmartCampusLibrary deployed to:", await smartCampusLibrary.getAddress());

  // 7. Deploy Complaints Contract
  const SmartCampusComplaints = await ethers.getContractFactory("SmartCampusComplaints");
  const smartCampusComplaints = await SmartCampusComplaints.deploy(deployerAddress);
  await smartCampusComplaints.waitForDeployment();
  console.log("SmartCampusComplaints deployed to:", await smartCampusComplaints.getAddress());

  // 8. Deploy Governance Contract
  const SmartCampusGovernance = await ethers.getContractFactory("SmartCampusGovernance");
  const smartCampusGovernance = await SmartCampusGovernance.deploy(deployerAddress);
  await smartCampusGovernance.waitForDeployment();
  console.log("SmartCampusGovernance deployed to:", await smartCampusGovernance.getAddress());

  // 9. Deploy Workplace Contract
  const SmartCampusWorkplace = await ethers.getContractFactory("SmartCampusWorkplace");
  const smartCampusWorkplace = await SmartCampusWorkplace.deploy(deployerAddress);
  await smartCampusWorkplace.waitForDeployment();
  console.log("SmartCampusWorkplace deployed to:", await smartCampusWorkplace.getAddress());

  // 10. Deploy Identity Contract
  const SmartCampusIdentity = await ethers.getContractFactory("SmartCampusIdentity");
  const smartCampusIdentity = await SmartCampusIdentity.deploy(deployerAddress);
  await smartCampusIdentity.waitForDeployment();
  console.log("SmartCampusIdentity deployed to:", await smartCampusIdentity.getAddress());

  // 11. Deploy CampusLife Contract
  const SmartCampusCampusLife = await ethers.getContractFactory("SmartCampusCampusLife");
  const smartCampusCampusLife = await SmartCampusCampusLife.deploy(deployerAddress);
  await smartCampusCampusLife.waitForDeployment();
  console.log("SmartCampusCampusLife deployed to:", await smartCampusCampusLife.getAddress());

  // 12. Deploy AcademicPlus Contract
  const SmartCampusAcademicPlus = await ethers.getContractFactory("SmartCampusAcademicPlus");
  const smartCampusAcademicPlus = await SmartCampusAcademicPlus.deploy(deployerAddress);
  await smartCampusAcademicPlus.waitForDeployment();
  console.log("SmartCampusAcademicPlus deployed to:", await smartCampusAcademicPlus.getAddress());

  // 13. Deploy Learning Contract
  const SmartCampusLearning = await ethers.getContractFactory("SmartCampusLearning");
  const smartCampusLearning = await SmartCampusLearning.deploy(deployerAddress);
  await smartCampusLearning.waitForDeployment();
  console.log("SmartCampusLearning deployed to:", await smartCampusLearning.getAddress());

  // 14. Deploy Equity Contract
  const SmartCampusEquity = await ethers.getContractFactory("SmartCampusEquity");
  const smartCampusEquity = await SmartCampusEquity.deploy(deployerAddress);
  await smartCampusEquity.waitForDeployment();
  console.log("SmartCampusEquity deployed to:", await smartCampusEquity.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
