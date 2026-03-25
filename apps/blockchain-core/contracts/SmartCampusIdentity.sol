// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartCampusIdentity
 * @dev Handles KYC, time-based access control, and tournament prize pools.
 */
contract SmartCampusIdentity is Ownable {
    
    struct IdentityRecord {
        string userId;
        string kycHash;
        uint256 verifiedAt;
    }

    struct AccessPermission {
        address user;
        string resourceId;
        uint256 expiry;
    }

    mapping(address => IdentityRecord) public identities;
    mapping(bytes32 => AccessPermission) public permissions;
    mapping(string => uint256) public tournamentPrizes;

    event KYCVerified(address indexed user, string kycHash);
    event AccessGranted(address indexed user, string resourceId, uint256 expiry);
    event TournamentFunded(string indexed tournamentId, uint256 amount);
    event TournamentPrizeDistributed(string indexed tournamentId, address indexed winner, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // --- KYC ---
    function verifyKYC(address user, string calldata userId, string calldata kycHash) external onlyOwner {
        identities[user] = IdentityRecord(userId, kycHash, block.timestamp);
        emit KYCVerified(user, kycHash);
    }

    // --- Access Control ---
    function grantAccess(address user, string calldata resourceId, uint256 duration) external onlyOwner {
        bytes32 key = keccak256(abi.encodePacked(user, resourceId));
        uint256 expiry = block.timestamp + duration;
        permissions[key] = AccessPermission(user, resourceId, expiry);
        emit AccessGranted(user, resourceId, expiry);
    }

    function hasAccess(address user, string calldata resourceId) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(user, resourceId));
        return permissions[key].expiry > block.timestamp;
    }

    // --- Gaming Tournaments ---
    function fundTournament(string calldata tournamentId) external payable {
        tournamentPrizes[tournamentId] += msg.value;
        emit TournamentFunded(tournamentId, msg.value);
    }

    function distributeTournamentPrize(string calldata tournamentId, address winner) external onlyOwner {
        uint256 amount = tournamentPrizes[tournamentId];
        require(amount > 0, "No prize pool");
        tournamentPrizes[tournamentId] = 0;
        (bool success, ) = payable(winner).call{value: amount}("");
        require(success, "Prize distribution failed");
        emit TournamentPrizeDistributed(tournamentId, winner, amount);
    }
}
