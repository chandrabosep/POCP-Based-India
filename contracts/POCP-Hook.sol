// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISP, Attestation} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook, IERC20} from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";

/// Custom Errors for better gas efficiency and clarity
error POCP__InvalidEventId();
error POCP__AttestationAlreadyExists();
error POCP__InvalidConnectionData();
error POCP__EventNotFound();
error POCP__EventExpired();
error POCP__InvalidTimestamp();
error POCP__InvalidAttestation();
error POCP__RevocationNotAllowed();

/**
 * @title POCP - Proof of Connection Protocol
 * @notice This contract implements the Proof of Connection Protocol (POCP), which tracks and validates user connections at events.
 * It leverages the Ethereum Sign Protocol (ISP) to manage attestations and hooks into various user operations.
 * @dev The contract uses mappings to store event expiration timestamps, user connections, and reputation scores.
 * @custom:security-contact mujahidshaik2002@gmail.com
 */
contract POCP_HOOK is ISPHook {
    /// @notice Reference to the ISP (Sign Protocol) contract, which manages the attestations.
    ISP private s_baseIspContract;

    /// @notice Maps an event's unique identifier to its expiration timestamp (in Unix format).
    mapping(string => uint64) private s_eventExpirationTimestamps;

    /// @notice Tracks the number of connections made by each user for a given event.
    /// @dev The first key is the user's address, and the second key is the event ID.
    /// This allows for counting the number of connections made by each user per event.
    mapping(address => mapping(string => uint8))
        private s_userConnectionsPerEvent;

    /// @notice Stores the reputation score of each user based on their attestation activities.
    mapping(address => uint64) private s_userReputation;

    /**
     * @notice Contract constructor. Initializes the contract with the ISP (Sign Protocol) address.
     * @dev The contract is deployed with the ISP contract hardcoded in the constructor for now.
     * Future versions may allow the address to be passed as a parameter.
     */
    constructor() {
        /// Initialize the ISP contract address.
        s_baseIspContract = ISP(0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD);
    }

    /*****************************
        STATE UPDATE FUNCTIONS
    ******************************/
    /**
     * @notice Registers an event by its ID and sets its expiration time to 24 hours from the current time.
     * @dev This function allows anyone to register an event. Events are valid for 24 hours only.
     * @param eventId A unique string that identifies the event being registered.
     * @custom:error POCP__InvalidEventId Thrown when the event ID is an empty string.
     */
    function addCheckInData(string memory eventId) public {
        if (bytes(eventId).length == 0) revert POCP__InvalidEventId();
        s_eventExpirationTimestamps[eventId] = uint64(
            block.timestamp + 24 hours
        );
    }

    /*****************************
        HELPER HOOK FUNCTIONS
    ******************************/
    /**
     * @notice Validates an attestation by ensuring it is unique and within the valid time frame of the event.
     * @dev This function interacts with the ISP contract to retrieve attestation data and performs checks to verify validity.
     * @param attestationId The ID of the attestation being checked.
     * @param attester The address of the attester who submitted the attestation.
     * @custom:error POCP__EventNotFound Thrown when the event related to the attestation does not exist.
     * @custom:error POCP__EventExpired Thrown when the attestation is submitted after the event expiration.
     * @custom:error POCP__AttestationAlreadyExists Thrown when the user has already made an attestation for the event.
     * @custom:error POCP__InvalidConnectionData Thrown when the attestation data contains invalid connection data.
     */
    function checkAttestationHook(
        uint64 attestationId,
        address attester
    ) public {
        // Retrieve attestation details from the ISP contract.
        Attestation memory attestation = s_baseIspContract.getAttestation(
            attestationId
        );

        // Decode the attestation data to extract event-related information.
        (
            string memory eventId,
            ,
            uint8 connectionCount,
            address[] memory connectedAddresses
        ) = abi.decode(attestation.data, (string, string, uint8, address[]));

        // Ensure the event exists.
        if (s_eventExpirationTimestamps[eventId] == 0)
            revert POCP__EventNotFound();

        // Check if the attestation is within the valid time period.
        if (attestation.attestTimestamp > s_eventExpirationTimestamps[eventId])
            revert POCP__EventExpired();

        // Ensure the user has not already submitted an attestation for the event.
        if (s_userConnectionsPerEvent[attester][eventId] != 0)
            revert POCP__AttestationAlreadyExists();

        // Validate the number of connected addresses.
        if (
            connectedAddresses.length == 0 ||
            connectedAddresses.length != uint256(connectionCount)
        ) {
            revert POCP__InvalidConnectionData();
        }

        // Record the connection count and update the user's reputation.
        s_userConnectionsPerEvent[attester][eventId] = connectionCount;
        s_userReputation[attester] += 1;
    }

    /**
     * @notice This hook function is disabled to prevent any attestation revocations.
     * @dev Always reverts with `POCP__RevocationNotAllowed`.
     */
    function checkRevocationHook() public pure {
        revert POCP__RevocationNotAllowed();
    }

    /*****************************
        ISP HOOK FUNCTIONS
    ******************************/
    /**
     * @notice Handles attestations and validates them using the custom attestation logic in `checkAttestationHook`.
     * @param attester The address of the attester submitting the attestation.
     * @param attestationId The ID of the attestation being processed.
     */
    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        bytes calldata
    ) public payable {
        checkAttestationHook(attestationId, attester);
    }

    /**
     * @notice Handles attestations with ERC20 tokens and processes them with the attestation logic.
     * @param attester The address of the attester submitting the attestation.
     * @param attestationId The ID of the attestation.
     */
    function didReceiveAttestation(
        address attester,
        uint64,
        uint64 attestationId,
        IERC20,
        uint256,
        bytes calldata
    ) public {
        checkAttestationHook(attestationId, attester);
    }

    /**
     * @notice Handles revocation requests, but this functionality is not allowed in the protocol.
     * Always reverts with the `POCP__RevocationNotAllowed` error.
     */
    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        bytes calldata
    ) public payable {
        checkRevocationHook();
    }

    /**
     * @notice Handles ERC20 revocations, but this functionality is not allowed in the protocol.
     * Always reverts with the `POCP__RevocationNotAllowed` error.
     */
    function didReceiveRevocation(
        address,
        uint64,
        uint64,
        IERC20,
        uint256,
        bytes calldata
    ) public pure {
        checkRevocationHook();
    }

    /*****************************
        VIEW FUNCTIONS
    ******************************/
    /**
     * @notice Returns the total number of events by querying the ISP contract's attestation counter.
     * @return uint64 The total number of events registered in the ISP contract.
     */
    function totalEvents() public view returns (uint64) {
        return s_baseIspContract.attestationCounter();
    }

    /**
     * @notice Retrieves the expiration timestamp of a registered event.
     * @param eventId The unique identifier of the event.
     * @return uint64 The expiration timestamp of the event in Unix format (seconds since epoch).
     */
    function getEventExpiration(
        string memory eventId
    ) public view returns (uint64) {
        return s_eventExpirationTimestamps[eventId];
    }

    /**
     * @notice Retrieves the number of connections a user has made for a specific event.
     * @param user The address of the user.
     * @param eventId The unique identifier of the event.
     * @return uint8 The number of connections the user has made for the event.
     */
    function getUserConnectionCountForEvent(
        address user,
        string memory eventId
    ) public view returns (uint8) {
        return s_userConnectionsPerEvent[user][eventId];
    }

    /**
     * @notice Retrieves the reputation score of a user based on their attestations.
     * @param user The address of the user.
     * @return uint64 The reputation score of the user.
     */
    function getReputationScore(address user) public view returns (uint64) {
        return s_userReputation[user];
    }
}
