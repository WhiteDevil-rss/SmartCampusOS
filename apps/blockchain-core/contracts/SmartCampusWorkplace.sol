// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusWorkplace
 * @dev Handles faculty payroll, internships, skill verification, and campus marketplace.
 */
contract SmartCampusWorkplace is Ownable {
    
    struct Internship {
        string internshipId;
        address student;
        string company;
        bool completed;
        string certificateHash;
    }

    struct JobOffer {
        string jobId;
        address employer;
        uint256 budget;
        bool isEscrowed;
        bool isCompleted;
    }

    mapping(string => Internship) public internships;
    mapping(string => JobOffer) public jobs;
    mapping(address => mapping(string => bool)) public verifiedSkills; // student => skillBadge => verified

    event SalaryBonusReleased(address indexed faculty, uint256 amount, string reason);
    event InternshipCompleted(string indexed internshipId, address student, string certificateHash);
    event SkillVerified(address indexed student, string skillBadge);
    event JobEscrowed(string indexed jobId, uint256 amount);
    event JobPaymentReleased(string indexed jobId, address indexed freelancer, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Payroll & Bonuses ---
    function releaseBonus(address faculty, string calldata reason) external payable onlyOwner {
        require(msg.value > 0, "Bonus amount must be > 0");
        (bool success, ) = payable(faculty).call{value: msg.value}("");
        require(success, "Bonus distribution failed");
        emit SalaryBonusReleased(faculty, msg.value, reason);
    }

    // --- Internships ---
    function registerInternship(string calldata internshipId, address student, string calldata company) external onlyOwner {
        internships[internshipId] = Internship(internshipId, student, company, false, "");
    }

    function completeInternship(string calldata internshipId, string calldata certificateHash) external onlyOwner {
        Internship storage i = internships[internshipId];
        i.completed = true;
        i.certificateHash = certificateHash;
        emit InternshipCompleted(internshipId, i.student, certificateHash);
    }

    // --- Skills ---
    function verifySkill(address student, string calldata skillBadge) external onlyOwner {
        verifiedSkills[student][skillBadge] = true;
        emit SkillVerified(student, skillBadge);
    }

    // --- Marketplace Escrow ---
    function postJob(string calldata jobId) external payable {
        require(msg.value > 0, "Escrow amount must be > 0");
        jobs[jobId] = JobOffer(jobId, msg.sender, msg.value, true, false);
        emit JobEscrowed(jobId, msg.value);
    }

    function releaseJobPayment(string calldata jobId, address freelancer) external onlyOwner {
        JobOffer storage j = jobs[jobId];
        require(j.isEscrowed && !j.isCompleted, "Invalid job state");
        j.isCompleted = true;
        (bool success, ) = payable(freelancer).call{value: j.budget}("");
        require(success, "Payment release failed");
        emit JobPaymentReleased(jobId, freelancer, j.budget);
    }
}
