// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusAdmission
 * @dev Records key admission milestones for transparency.
 */
contract SmartCampusAdmission is Ownable {
    enum AdmissionStatus { APPLIED, SHORTLISTED, REJECTED, ADMITTED, WITHDRAWN }

    struct AdmissionRecord {
        string studentEnrollment; // Or temporary application ID
        string programId;
        AdmissionStatus status;
        string documentHash; // Hash of admission documents
        uint256 lastUpdated;
    }

    // applicationID => AdmissionRecord
    mapping(string => AdmissionRecord) public admissions;

    event AdmissionStatusUpdated(string indexed applicationId, AdmissionStatus status, string documentHash);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function updateAdmissionStatus(
        string memory _applicationId,
        string memory _studentEnrollment,
        string memory _programId,
        AdmissionStatus _status,
        string memory _documentHash
    ) public onlyOwner {
        admissions[_applicationId] = AdmissionRecord({
            studentEnrollment: _studentEnrollment,
            programId: _programId,
            status: _status,
            documentHash: _documentHash,
            lastUpdated: block.timestamp
        });
        emit AdmissionStatusUpdated(_applicationId, _status, _documentHash);
    }

    function getAdmissionRecord(string memory _applicationId) 
        public view returns (string memory, string memory, AdmissionStatus, string memory, uint256) 
    {
        AdmissionRecord memory record = admissions[_applicationId];
        return (record.studentEnrollment, record.programId, record.status, record.documentHash, record.lastUpdated);
    }
}
