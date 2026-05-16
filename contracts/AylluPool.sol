// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IAyniScore.sol";

/// @title AylluPool - Pool de ahorro rotativo descentralizado
/// @notice Gestiona multiples ayllus, cada uno con su propio ciclo de rondas
contract AylluPool is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable paymentToken;
    IAyniScore public ayniScore;

    enum AylluStatus { FORMING, ACTIVE, COMPLETED, CANCELLED }

    struct Ayllu {
        string name;
        address creator;
        uint256 contributionAmount;
        uint256 roundDuration;
        uint8 maxMembers;
        uint8 currentMemberCount;
        uint8 currentRound;
        uint256 roundStartedAt;
        AylluStatus status;
    }

    struct Member {
        address wallet;
        bool hasContributedThisRound;
        bool hasReceivedPot;
        uint8 roundToReceive;
        uint256 totalContributed;
        uint256 latePayments;
    }

    // Storage
    uint256 public nextAylluId;
    mapping(uint256 => Ayllu) public ayllus;
    mapping(uint256 => Member[]) internal _members;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(uint256 => uint256) public roundPot;

    // Limites
    uint256 public constant MIN_CONTRIBUTION = 5 * 10 ** 6;       // 5 USDC
    uint256 public constant MAX_CONTRIBUTION = 10_000 * 10 ** 6;  // 10,000 USDC
    uint8 public constant MIN_MEMBERS = 2;
    uint8 public constant MAX_MEMBERS = 20;
    uint256 public constant MIN_ROUND_DURATION = 1 hours;         // 1h para demos
    uint256 public constant MAX_ROUND_DURATION = 30 days;
    uint256 public constant LATE_THRESHOLD = 1 hours;

    // Events
    event AylluCreated(uint256 indexed aylluId, address indexed creator, string name, uint256 contribution, uint8 maxMembers);
    event MemberJoined(uint256 indexed aylluId, address indexed member, uint8 position);
    event ContributionMade(uint256 indexed aylluId, address indexed member, uint256 amount, uint8 round, bool isLate);
    event PotDistributed(uint256 indexed aylluId, address indexed recipient, uint256 amount, uint8 round);
    event AylluCompleted(uint256 indexed aylluId);
    event AylluCancelled(uint256 indexed aylluId);
    event RoundAdvanced(uint256 indexed aylluId, uint8 newRound);

    constructor(address _paymentToken, address _ayniScore) Ownable(msg.sender) {
        require(_paymentToken != address(0), "Token cero");
        require(_ayniScore != address(0), "AyniScore cero");
        paymentToken = IERC20(_paymentToken);
        ayniScore = IAyniScore(_ayniScore);
    }

    // ===================== CREAR AYLLU =====================

    function createAyllu(
        string calldata name,
        uint8 maxMembers_,
        uint256 contributionAmount_,
        uint256 roundDuration_
    ) external whenNotPaused returns (uint256 aylluId) {
        require(bytes(name).length > 0 && bytes(name).length <= 64, "Nombre invalido");
        require(maxMembers_ >= MIN_MEMBERS && maxMembers_ <= MAX_MEMBERS, "Miembros fuera de rango");
        require(contributionAmount_ >= MIN_CONTRIBUTION && contributionAmount_ <= MAX_CONTRIBUTION, "Monto fuera de rango");
        require(roundDuration_ >= MIN_ROUND_DURATION && roundDuration_ <= MAX_ROUND_DURATION, "Duracion fuera de rango");

        aylluId = nextAylluId++;
        ayllus[aylluId] = Ayllu({
            name: name,
            creator: msg.sender,
            contributionAmount: contributionAmount_,
            roundDuration: roundDuration_,
            maxMembers: maxMembers_,
            currentMemberCount: 1,
            currentRound: 0,
            roundStartedAt: 0,
            status: AylluStatus.FORMING
        });

        _members[aylluId].push(Member({
            wallet: msg.sender,
            hasContributedThisRound: false,
            hasReceivedPot: false,
            roundToReceive: 0,
            totalContributed: 0,
            latePayments: 0
        }));
        isMember[aylluId][msg.sender] = true;

        emit AylluCreated(aylluId, msg.sender, name, contributionAmount_, maxMembers_);
        emit MemberJoined(aylluId, msg.sender, 0);
    }

    // ===================== UNIRSE =====================

    function joinAyllu(uint256 aylluId) external whenNotPaused {
        Ayllu storage ayllu = ayllus[aylluId];
        require(ayllu.status == AylluStatus.FORMING, "Ayllu no acepta miembros");
        require(!isMember[aylluId][msg.sender], "Ya eres miembro");
        require(ayllu.currentMemberCount < ayllu.maxMembers, "Ayllu lleno");

        uint8 position = ayllu.currentMemberCount;
        _members[aylluId].push(Member({
            wallet: msg.sender,
            hasContributedThisRound: false,
            hasReceivedPot: false,
            roundToReceive: position,
            totalContributed: 0,
            latePayments: 0
        }));
        isMember[aylluId][msg.sender] = true;
        ayllu.currentMemberCount++;

        emit MemberJoined(aylluId, msg.sender, position);

        if (ayllu.currentMemberCount == ayllu.maxMembers) {
            ayllu.status = AylluStatus.ACTIVE;
            ayllu.roundStartedAt = block.timestamp;
        }
    }

    // ===================== CONTRIBUIR =====================

    function contribute(uint256 aylluId) external nonReentrant whenNotPaused {
        Ayllu storage ayllu = ayllus[aylluId];
        require(ayllu.status == AylluStatus.ACTIVE, "Ayllu no activo");
        require(isMember[aylluId][msg.sender], "No eres miembro");

        uint8 memberIndex = _getMemberIndex(aylluId, msg.sender);
        Member storage member = _members[aylluId][memberIndex];
        require(!member.hasContributedThisRound, "Ya contribuiste esta ronda");

        bool isLate = block.timestamp > ayllu.roundStartedAt + LATE_THRESHOLD;
        if (isLate) {
            member.latePayments++;
        }

        paymentToken.safeTransferFrom(msg.sender, address(this), ayllu.contributionAmount);
        member.hasContributedThisRound = true;
        member.totalContributed += ayllu.contributionAmount;
        roundPot[aylluId] += ayllu.contributionAmount;

        emit ContributionMade(aylluId, msg.sender, ayllu.contributionAmount, ayllu.currentRound, isLate);

        if (_allContributed(aylluId)) {
            _distributePot(aylluId);
        }
    }

    // ===================== DISTRIBUIR =====================

    function _distributePot(uint256 aylluId) internal {
        Ayllu storage ayllu = ayllus[aylluId];
        uint256 pot = roundPot[aylluId];
        require(pot > 0, "Pozo vacio");

        address recipient;
        for (uint8 i = 0; i < ayllu.currentMemberCount; i++) {
            if (_members[aylluId][i].roundToReceive == ayllu.currentRound) {
                recipient = _members[aylluId][i].wallet;
                _members[aylluId][i].hasReceivedPot = true;
                break;
            }
        }
        require(recipient != address(0), "Sin receptor");

        roundPot[aylluId] = 0;
        paymentToken.safeTransfer(recipient, pot);

        emit PotDistributed(aylluId, recipient, pot, ayllu.currentRound);

        ayniScore.recordRoundCompletion(recipient, aylluId, ayllu.currentRound);

        if (ayllu.currentRound + 1 >= ayllu.maxMembers) {
            ayllu.status = AylluStatus.COMPLETED;
            emit AylluCompleted(aylluId);
            for (uint8 i = 0; i < ayllu.currentMemberCount; i++) {
                ayniScore.recordAylluCompletion(
                    _members[aylluId][i].wallet,
                    aylluId,
                    _members[aylluId][i].latePayments
                );
            }
        } else {
            ayllu.currentRound++;
            ayllu.roundStartedAt = block.timestamp;
            for (uint8 i = 0; i < ayllu.currentMemberCount; i++) {
                _members[aylluId][i].hasContributedThisRound = false;
            }
            emit RoundAdvanced(aylluId, ayllu.currentRound);
        }
    }

    // ===================== ADMIN =====================

    /// @notice Cancelar un ayllu en estado FORMING (solo creador u owner)
    function cancelAyllu(uint256 aylluId) external {
        Ayllu storage ayllu = ayllus[aylluId];
        require(
            ayllu.status == AylluStatus.FORMING,
            "Solo se puede cancelar en estado FORMING"
        );
        require(
            msg.sender == ayllu.creator || msg.sender == owner(),
            "No autorizado"
        );
        ayllu.status = AylluStatus.CANCELLED;
        emit AylluCancelled(aylluId);
    }

    /// @notice Forzar distribucion en emergencias (solo owner)
    function forceDistribute(uint256 aylluId) external onlyOwner {
        require(ayllus[aylluId].status == AylluStatus.ACTIVE, "Ayllu no activo");
        require(roundPot[aylluId] > 0, "Pozo vacio");
        _distributePot(aylluId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ===================== VIEWS =====================

    function getAyllu(uint256 aylluId) external view returns (Ayllu memory) {
        return ayllus[aylluId];
    }

    function getMembers(uint256 aylluId) external view returns (Member[] memory) {
        return _members[aylluId];
    }

    function getRoundInfo(uint256 aylluId) external view returns (
        uint8 currentRound,
        uint256 potAmount,
        uint256 roundEndsAt,
        address roundRecipient
    ) {
        Ayllu memory ayllu = ayllus[aylluId];
        currentRound = ayllu.currentRound;
        potAmount = roundPot[aylluId];
        roundEndsAt = ayllu.roundStartedAt + ayllu.roundDuration;
        for (uint8 i = 0; i < _members[aylluId].length; i++) {
            if (_members[aylluId][i].roundToReceive == currentRound) {
                roundRecipient = _members[aylluId][i].wallet;
                break;
            }
        }
    }

    function getMemberContributionStatus(uint256 aylluId, address wallet) external view returns (bool) {
        for (uint8 i = 0; i < _members[aylluId].length; i++) {
            if (_members[aylluId][i].wallet == wallet) {
                return _members[aylluId][i].hasContributedThisRound;
            }
        }
        return false;
    }

    // ===================== HELPERS =====================

    function _getMemberIndex(uint256 aylluId, address wallet) internal view returns (uint8) {
        for (uint8 i = 0; i < _members[aylluId].length; i++) {
            if (_members[aylluId][i].wallet == wallet) return i;
        }
        revert("Miembro no encontrado");
    }

    function _allContributed(uint256 aylluId) internal view returns (bool) {
        for (uint8 i = 0; i < ayllus[aylluId].currentMemberCount; i++) {
            if (!_members[aylluId][i].hasContributedThisRound) return false;
        }
        return true;
    }
}
