// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAyniScore.sol";

/// @title AyniScore - Registro de reputacion financiera on-chain
/// @notice Almacena scores y metricas de participacion para cada wallet
contract AyniScore is IAyniScore, AccessControl {
    bytes32 public constant SCORE_UPDATER_ROLE = keccak256("SCORE_UPDATER_ROLE");

    struct ScoreRecord {
        uint256 score;
        uint256 roundsCompleted;
        uint256 ayllisCompleted;
        uint256 totalLatePayments;
        uint256 totalContributed;
        uint256 lastUpdated;
    }

    struct ScoreHistoryEntry {
        uint256 score;
        uint256 timestamp;
        string reason;
    }

    mapping(address => ScoreRecord) public scores;
    mapping(address => ScoreHistoryEntry[]) internal _scoreHistory;

    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore, string reason);
    event RoundRecorded(address indexed user, uint256 aylluId, uint8 round);
    event AylluCompletionRecorded(address indexed user, uint256 aylluId, uint256 latePayments);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantScoreUpdater(address updater) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SCORE_UPDATER_ROLE, updater);
    }

    /// @notice Llamado por AylluPool cuando un usuario completa una ronda
    function recordRoundCompletion(
        address user,
        uint256 aylluId,
        uint8 round
    ) external onlyRole(SCORE_UPDATER_ROLE) {
        scores[user].roundsCompleted++;
        _recalculateScore(user, "round_completed");
        emit RoundRecorded(user, aylluId, round);
    }

    /// @notice Llamado por AylluPool cuando un ayllu completo termina
    function recordAylluCompletion(
        address user,
        uint256 aylluId,
        uint256 latePayments
    ) external onlyRole(SCORE_UPDATER_ROLE) {
        scores[user].ayllisCompleted++;
        scores[user].totalLatePayments += latePayments;
        _recalculateScore(user, "ayllu_completed");
        emit AylluCompletionRecorded(user, aylluId, latePayments);
    }

    /// @notice Score ajustado por el sistema AI (off-chain via API)
    function setScore(
        address user,
        uint256 newScore,
        string calldata reason
    ) external onlyRole(SCORE_UPDATER_ROLE) {
        require(newScore <= 1000, "Score max 1000");
        uint256 oldScore = scores[user].score;
        scores[user].score = newScore;
        scores[user].lastUpdated = block.timestamp;

        _scoreHistory[user].push(ScoreHistoryEntry({
            score: newScore,
            timestamp: block.timestamp,
            reason: reason
        }));

        emit ScoreUpdated(user, oldScore, newScore, reason);
    }

    function _recalculateScore(address user, string memory reason) internal {
        ScoreRecord storage record = scores[user];

        uint256 baseScore = record.roundsCompleted * 50;
        uint256 bonusAyllu = record.ayllisCompleted * 100;
        uint256 penalty = record.totalLatePayments * 25;

        uint256 rawScore = baseScore + bonusAyllu;
        uint256 newScore = rawScore > penalty ? rawScore - penalty : 0;
        if (newScore > 1000) newScore = 1000;

        uint256 oldScore = record.score;
        record.score = newScore;
        record.lastUpdated = block.timestamp;

        _scoreHistory[user].push(ScoreHistoryEntry({
            score: newScore,
            timestamp: block.timestamp,
            reason: reason
        }));

        emit ScoreUpdated(user, oldScore, newScore, reason);
    }

    // --- Views ---

    function getScore(address user) external view returns (uint256) {
        return scores[user].score;
    }

    function getScoreLevel(address user) external view returns (string memory) {
        uint256 score = scores[user].score;
        if (score >= 800) return "excellent";
        if (score >= 600) return "good";
        return "building";
    }

    function getFullRecord(address user) external view returns (ScoreRecord memory) {
        return scores[user];
    }

    function getHistory(address user) external view returns (ScoreHistoryEntry[] memory) {
        return _scoreHistory[user];
    }

    function getHistoryLength(address user) external view returns (uint256) {
        return _scoreHistory[user].length;
    }
}
