// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusAcademicPlus
 * @dev Handles scholarships, exam security, and advanced certification.
 */
contract SmartCampusAcademicPlus is Ownable {
    
    struct ExamPaper {
        string examId;
        string paperHash; // Encrypted hash
        uint256 releaseTime;
        bool exists;
    }

    struct Scholarship {
        string scholarshipId;
        uint256 totalFund;
        uint256 amountPerStudent;
        bool isActive;
    }

    mapping(string => ExamPaper) public examPapers;
    mapping(string => Scholarship) public scholarships;
    mapping(address => mapping(string => bool)) public scholarshipReceived;

    event ExamPaperRegistered(string indexed examId, uint256 releaseTime);
    event ScholarshipCreated(string indexed scholarshipId, uint256 totalFund);
    event ScholarshipDistributed(string indexed scholarshipId, address indexed student, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- Exam Security ---
    function registerExamPaper(string calldata examId, string calldata paperHash, uint256 releaseTime) external onlyOwner {
        examPapers[examId] = ExamPaper(examId, paperHash, releaseTime, true);
        emit ExamPaperRegistered(examId, releaseTime);
    }

    function getExamPaper(string calldata examId) external view returns (string memory) {
        ExamPaper memory paper = examPapers[examId];
        require(paper.exists, "Exam does not exist");
        require(block.timestamp >= paper.releaseTime, "Paper not yet released");
        return paper.paperHash;
    }

    // --- Scholarship Distribution ---
    function createScholarship(string calldata scholarshipId, uint256 amountPerStudent) external payable onlyOwner {
        scholarships[scholarshipId] = Scholarship(scholarshipId, msg.value, amountPerStudent, true);
        emit ScholarshipCreated(scholarshipId, msg.value);
    }

    function distributeScholarship(string calldata scholarshipId, address student) external onlyOwner {
        Scholarship storage s = scholarships[scholarshipId];
        require(s.isActive, "Scholarship not active");
        require(s.totalFund >= s.amountPerStudent, "Insufficient funds in scholarship");
        require(!scholarshipReceived[student][scholarshipId], "Already received");

        s.totalFund -= s.amountPerStudent;
        scholarshipReceived[student][scholarshipId] = true;
        
        (bool success, ) = payable(student).call{value: s.amountPerStudent}("");
        require(success, "Distribution failed");
        
        emit ScholarshipDistributed(scholarshipId, student, s.amountPerStudent);
    }
}
