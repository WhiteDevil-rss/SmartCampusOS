// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusHiring
 * @dev Manages job postings, student applications, and placement offers on-chain.
 */
contract SmartCampusHiring is Ownable {
    struct JobListing {
        uint256 id;
        string institutionalId; // ID from the main database
        string jobTitle;
        string companyName;
        bool isActive;
    }

    struct PlacementOffer {
        string studentEnrollment;
        string jobListingId;
        string offerHash; // SHA-256 hash of the offer letter/details
        uint256 timestamp;
        bool isAccepted;
    }

    mapping(uint256 => JobListing) public jobListings;
    uint256 public nextJobId;

    // studentEnrollment => jobListingId => PlacementOffer
    mapping(string => mapping(string => PlacementOffer)) public placementOffers;

    event JobPosted(uint256 indexed jobId, string institutionalId, string jobTitle, string companyName);
    event JobStatusChanged(uint256 indexed jobId, bool isActive);
    event PlacementRecorded(string indexed studentEnrollment, string jobListingId, string offerHash);
    event OfferAccepted(string indexed studentEnrollment, string jobListingId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function postJob(string memory _institutionalId, string memory _jobTitle, string memory _companyName) public onlyOwner {
        jobListings[nextJobId] = JobListing({
            id: nextJobId,
            institutionalId: _institutionalId,
            jobTitle: _jobTitle,
            companyName: _companyName,
            isActive: true
        });
        emit JobPosted(nextJobId, _institutionalId, _jobTitle, _companyName);
        nextJobId++;
    }

    function toggleJobStatus(uint256 _jobId) public onlyOwner {
        jobListings[_jobId].isActive = !jobListings[_jobId].isActive;
        emit JobStatusChanged(_jobId, jobListings[_jobId].isActive);
    }

    function recordPlacement(
        string memory _studentEnrollment,
        string memory _jobListingId,
        string memory _offerHash
    ) public onlyOwner {
        placementOffers[_studentEnrollment][_jobListingId] = PlacementOffer({
            studentEnrollment: _studentEnrollment,
            jobListingId: _jobListingId,
            offerHash: _offerHash,
            timestamp: block.timestamp,
            isAccepted: false
        });
        emit PlacementRecorded(_studentEnrollment, _jobListingId, _offerHash);
    }

    function acceptOffer(string memory _studentEnrollment, string memory _jobListingId) public {
        // In a real scenario, this would check if msg.sender corresponds to the student
        // Or be called by the system after student confirms in the portal.
        placementOffers[_studentEnrollment][_jobListingId].isAccepted = true;
        emit OfferAccepted(_studentEnrollment, _jobListingId);
    }

    function getPlacement(string memory _studentEnrollment, string memory _jobListingId) 
        public view returns (string memory, string memory, uint256, bool) 
    {
        PlacementOffer memory offer = placementOffers[_studentEnrollment][_jobListingId];
        return (offer.jobListingId, offer.offerHash, offer.timestamp, offer.isAccepted);
    }
}
