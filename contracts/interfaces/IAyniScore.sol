// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAyniScore {
    function recordRoundCompletion(address user, uint256 aylluId, uint8 round) external;
    function recordAylluCompletion(address user, uint256 aylluId, uint256 latePayments) external;
    function getScore(address user) external view returns (uint256);
    function setScore(address user, uint256 newScore, string calldata reason) external;
}
