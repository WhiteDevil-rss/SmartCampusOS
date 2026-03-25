import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Contract ABIs
import SmartCampusVerifyABI from '../abis/SmartCampusVerify.json';
import SmartCampusHiringABI from '../abis/SmartCampusHiring.json';
import SmartCampusFinanceABI from '../abis/SmartCampusFinance.json';
import SmartCampusAdmissionABI from '../abis/SmartCampusAdmission.json';
import SmartCampusReevaluationABI from '../abis/SmartCampusReevaluation.json';
import SmartCampusLibraryABI from '../abis/SmartCampusLibrary.json';
import SmartCampusComplaintsABI from '../abis/SmartCampusComplaints.json';
import SmartCampusGovernanceABI from '../abis/SmartCampusGovernance.json';
import SmartCampusWorkplaceABI from '../abis/SmartCampusWorkplace.json';
import SmartCampusIdentityABI from '../abis/SmartCampusIdentity.json';
import SmartCampusCampusLifeABI from '../abis/SmartCampusCampusLife.json';
import SmartCampusAcademicPlusABI from '../abis/SmartCampusAcademicPlus.json';
import SmartCampusLearningABI from '../abis/SmartCampusLearning.json';
import SmartCampusEquityABI from '../abis/SmartCampusEquity.json';

const PROVIDER_URL = process.env.BLOCKCHAIN_PROVIDER_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;

export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet | null = null;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        if (PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
        }
    }

    private getContract(address: string, abi: any) {
        if (!this.wallet) {
            throw new Error('Blockchain wallet not configured. Set BLOCKCHAIN_PRIVATE_KEY in .env');
        }
        return new ethers.Contract(address, abi, this.wallet);
    }

    // --- 1. Verification Module ---
    async recordResult(enrollmentNo: string, resultHash: string) {
        const address = process.env.CONTRACT_VERIFY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusVerifyABI.abi);
        const tx = await contract.publishResult(enrollmentNo, resultHash);
        return await tx.wait();
    }

    // --- 2. Hiring Module ---
    async recordPlacement(enrollmentNo: string, jobId: string, offerHash: string) {
        const address = process.env.CONTRACT_HIRING_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusHiringABI.abi);
        const tx = await contract.recordPlacement(enrollmentNo, jobId, offerHash);
        return await tx.wait();
    }

    // --- 3. Finance Module ---
    async recordFeePayment(enrollmentNo: string, feeType: string, amount: number, txId: string) {
        const address = process.env.CONTRACT_FINANCE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusFinanceABI.abi);
        const tx = await contract.recordFeePayment(enrollmentNo, feeType, amount, txId);
        return await tx.wait();
    }

    // --- 4. Admission Module ---
    async updateAdmissionStatus(appId: string, enrollmentNo: string, programId: string, status: number, docHash: string) {
        const address = process.env.CONTRACT_ADMISSION_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusAdmissionABI.abi);
        const tx = await contract.updateAdmissionStatus(appId, enrollmentNo, programId, status, docHash);
        return await tx.wait();
    }

    // --- 5. Re-evaluation Module ---
    async applyForReevaluation(requestId: string, feeAmount: string) {
        const address = process.env.CONTRACT_REEVALUATION_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusReevaluationABI.abi);
        const tx = await contract.applyForReevaluation(requestId, { value: ethers.parseEther(feeAmount) });
        return await tx.wait();
    }

    async resolveReevaluation(requestId: string, shouldRefund: boolean) {
        const address = process.env.CONTRACT_REEVALUATION_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusReevaluationABI.abi);
        const tx = await contract.resolveReevaluation(requestId, shouldRefund);
        return await tx.wait();
    }

    // --- 6. Library Module ---
    async recordBookLoan(loanId: string, isbn: string, enrollmentNo: string) {
        const address = process.env.CONTRACT_LIBRARY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusLibraryABI.abi);
        const tx = await contract.recordLoan(loanId, isbn, enrollmentNo);
        return await tx.wait();
    }

    async recordBookReturn(loanId: string, fineAmount: number) {
        const address = process.env.CONTRACT_LIBRARY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusLibraryABI.abi);
        const tx = await contract.recordReturn(loanId, fineAmount);
        return await tx.wait();
    }

    // --- 7. Complaints Module ---
    async registerComplaint(complaintId: string, deadlineDays: number) {
        const address = process.env.CONTRACT_COMPLAINTS_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusComplaintsABI.abi);
        const deadline = Math.floor(Date.now() / 1000) + (deadlineDays * 86400);
        const tx = await contract.registerComplaint(complaintId, deadline);
        return await tx.wait();
    }

    async resolveComplaintOnChain(complaintId: string) {
        const address = process.env.CONTRACT_COMPLAINTS_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusComplaintsABI.abi);
        const tx = await contract.resolveComplaint(complaintId);
        return await tx.wait();
    }

    // --- 8. Governance Module ---
    async createPoll(pollId: string, question: string, duration: number) {
        const address = process.env.CONTRACT_GOVERNANCE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusGovernanceABI.abi);
        const tx = await contract.createPoll(pollId, question, duration);
        return await tx.wait();
    }

    async castVote(pollId: string, optionIndex: number) {
        const address = process.env.CONTRACT_GOVERNANCE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusGovernanceABI.abi);
        const tx = await contract.vote(pollId, optionIndex);
        return await tx.wait();
    }

    async distributeContestPrize(contestId: string, winnerAddress: string) {
        const address = process.env.CONTRACT_GOVERNANCE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusGovernanceABI.abi);
        const tx = await contract.distributePrize(contestId, winnerAddress);
        return await tx.wait();
    }

    // --- 9. Workplace Module ---
    async releaseSalaryBonus(facultyAddress: string, amount: string, reason: string) {
        const address = process.env.CONTRACT_WORKPLACE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusWorkplaceABI.abi);
        const tx = await contract.releaseBonus(facultyAddress, reason, { value: ethers.parseEther(amount) });
        return await tx.wait();
    }

    async completeInternship(internshipId: string, certHash: string) {
        const address = process.env.CONTRACT_WORKPLACE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusWorkplaceABI.abi);
        const tx = await contract.completeInternship(internshipId, certHash);
        return await tx.wait();
    }

    async verifySkill(studentAddress: string, badge: string) {
        const address = process.env.CONTRACT_WORKPLACE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusWorkplaceABI.abi);
        const tx = await contract.verifySkill(studentAddress, badge);
        return await tx.wait();
    }

    // --- 10. Identity Module ---
    async verifyKYC(userAddress: string, userId: string, kycHash: string) {
        const address = process.env.CONTRACT_IDENTITY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusIdentityABI.abi);
        const tx = await contract.verifyKYC(userAddress, userId, kycHash);
        return await tx.wait();
    }

    async distributeTournamentPrize(tournamentId: string, winnerAddress: string) {
        const address = process.env.CONTRACT_IDENTITY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusIdentityABI.abi);
        const tx = await contract.distributeTournamentPrize(tournamentId, winnerAddress);
        return await tx.wait();
    }

    // --- 11. CampusLife Module ---
    async fundEvent(eventId: string, vendorAddress: string, amount: string) {
        const address = process.env.CONTRACT_CAMPUSLIFE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusCampusLifeABI.abi);
        const tx = await contract.fundEvent(eventId, vendorAddress, { value: ethers.parseEther(amount) });
        return await tx.wait();
    }

    async releaseEventPayment(eventId: string) {
        const address = process.env.CONTRACT_CAMPUSLIFE_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusCampusLifeABI.abi);
        const tx = await contract.releaseEventPayment(eventId);
        return await tx.wait();
    }

    // --- 12. AcademicPlus Module ---
    async registerExamPaper(examId: string, paperHash: string, releaseTime: number) {
        const address = process.env.CONTRACT_ACADEMICPLUS_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusAcademicPlusABI.abi);
        const tx = await contract.registerExamPaper(examId, paperHash, releaseTime);
        return await tx.wait();
    }

    async createScholarship(scholarshipId: string, amountPerStudent: number, totalAmount: string) {
        const address = process.env.CONTRACT_ACADEMICPLUS_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusAcademicPlusABI.abi);
        const tx = await contract.createScholarship(scholarshipId, amountPerStudent, { value: ethers.parseEther(totalAmount) });
        return await tx.wait();
    }

    async distributeScholarship(scholarshipId: string, studentAddress: string) {
        const address = process.env.CONTRACT_ACADEMICPLUS_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusAcademicPlusABI.abi);
        const tx = await contract.distributeScholarship(scholarshipId, studentAddress);
        return await tx.wait();
    }

    // --- 13. Learning Module ---
    async purchaseLearningModule(moduleId: string, amount: string) {
        const address = process.env.CONTRACT_LEARNING_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusLearningABI.abi);
        const tx = await contract.purchaseModule(moduleId, { value: ethers.parseEther(amount) });
        return await tx.wait();
    }

    async releaseCoachingPayment(sessionId: string) {
        const address = process.env.CONTRACT_LEARNING_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusLearningABI.abi);
        const tx = await contract.releaseCoachingPayment(sessionId);
        return await tx.wait();
    }

    // --- 14. Equity Module ---
    async registerStartup(startupId: string, founderAddress: string, totalEquity: string) {
        const address = process.env.CONTRACT_EQUITY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusEquityABI.abi);
        const tx = await contract.registerStartup(startupId, founderAddress, { value: ethers.parseEther(totalEquity) });
        return await tx.wait();
    }

    async achieveMilestone(startupId: string, milestoneIndex: number) {
        const address = process.env.CONTRACT_EQUITY_ADDRESS;
        if (!address) return null;
        const contract = this.getContract(address, SmartCampusEquityABI.abi);
        const tx = await contract.achieveMilestone(startupId, milestoneIndex);
        return await tx.wait();
    }
}

export const blockchainService = new BlockchainService();
