import { expect } from "chai";
import { ethers } from "hardhat";
import { SmartCampusVerify } from "../typechain-types";
import { Signer } from "ethers";

describe("SmartCampusVerify", function () {
  let smartCampusVerify: SmartCampusVerify;
  let owner: Signer;
  let otherAccount: Signer;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    const SmartCampusVerifyFactory = await ethers.getContractFactory("SmartCampusVerify");
    smartCampusVerify = await SmartCampusVerifyFactory.deploy(await owner.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await smartCampusVerify.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("Result Publishing", function () {
    const enrollmentNo = "EN20250000";
    const resultHash = ethers.keccak256(ethers.toUtf8Bytes("sample result data"));

    it("Should allow owner to publish result", async function () {
      await expect(smartCampusVerify.publishResult(enrollmentNo, resultHash))
        .to.emit(smartCampusVerify, "ResultPublished")
        .withArgs(enrollmentNo, resultHash, (anyValue: any) => true);

      expect(await smartCampusVerify.verifyResult(enrollmentNo, resultHash)).to.be.true;
    });

    it("Should fail if non-owner tries to publish result", async function () {
      await expect(
        smartCampusVerify.connect(otherAccount).publishResult(enrollmentNo, resultHash)
      ).to.be.revertedWithCustomError(smartCampusVerify, "OwnableUnauthorizedAccount");
    });

    it("Should return false for incorrect result hash", async function () {
      await smartCampusVerify.publishResult(enrollmentNo, resultHash);
      const incorrectHash = ethers.keccak256(ethers.toUtf8Bytes("wrong data"));
      expect(await smartCampusVerify.verifyResult(enrollmentNo, incorrectHash)).to.be.false;
    });
  });

  describe("Application Status", function () {
    const enrollmentNo = "EN20250001";
    const status = "ADMITTED";

    it("Should allow owner to update status", async function () {
      await expect(smartCampusVerify.updateApplicationStatus(enrollmentNo, status))
        .to.emit(smartCampusVerify, "StatusUpdated")
        .withArgs(enrollmentNo, status, (anyValue: any) => true);

      expect(await smartCampusVerify.getApplicationStatus(enrollmentNo)).to.equal(status);
    });

    it("Should fail if non-owner tries to update status", async function () {
      await expect(
        smartCampusVerify.connect(otherAccount).updateApplicationStatus(enrollmentNo, status)
      ).to.be.revertedWithCustomError(smartCampusVerify, "OwnableUnauthorizedAccount");
    });
  });

  describe("Data Integrity", function () {
    it("Should return record details correctly", async function () {
      const enrollmentNo = "EN20250002";
      const resultHash = ethers.keccak256(ethers.toUtf8Bytes("record data"));
      const status = "PENDING";

      await smartCampusVerify.publishResult(enrollmentNo, resultHash);
      await smartCampusVerify.updateApplicationStatus(enrollmentNo, status);

      const [storedHash, storedStatus, lastUpdated] = await smartCampusVerify.getStudentRecord(enrollmentNo);
      
      expect(storedHash).to.equal(resultHash);
      expect(storedStatus).to.equal(status);
      expect(lastUpdated).to.be.gt(0);
    });
  });
});
