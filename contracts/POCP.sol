// SPDX-License-Identifier: mujahid002
pragma solidity ^0.8.20;

import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

/// Custom Errors for better gas efficiency and clarity
error POCP__InvalidEventId();
error POCP__AttestationAlreadyExists();
error POCP__InvalidConnectionData();
error POCP__EventNotFound();
error POCP__EventExpired();
error POCP__InvalidTimestamp();
error POCP__InvalidAttestation();

/**
 * @title POCP - Proof of Connection Protocol
 * @author mujahid002
 * @custom:security-contact mujahidshaik2002@gmail.com
 */
contract POCP_EAS is SchemaResolver {
    /// @notice Maps an event's unique identifier to its expiration timestamp
    mapping(string => uint64) private s_eventExpirationTimestamps;

    /// @notice Maps an address and event ID to the number of connections made by the user in that event
    mapping(address => mapping(string => uint8))
        private s_userConnectionsPerEvent;

    /// @notice Maps a user's address to their reputation score
    mapping(address => uint64) private s_userReputation;

    /**
     * @dev Initializes the contract with the attestation schema resolver and ownership
     * @param _eas The Ethereum Attestation Service contract address used for attestations
     */
    constructor(IEAS _eas) SchemaResolver(_eas) {}

    /**
     * @notice Registers an event by its ID and sets its expiration time to 24 hours from the current time
     * @dev Anyone can register an event. Events are given a 24-hour validity period.
     * @param eventId A unique string that identifies the event being registered
     */
    function addCheckInData(string memory eventId) public {
        if (bytes(eventId).length == 0) revert POCP__InvalidEventId();
        s_eventExpirationTimestamps[eventId] = uint64(
            block.timestamp + 24 hours
        );
    }

    /**
     * @notice Handles an attestation when a user attests their participation or connection in an event
     * @dev This function checks the event validity, verifies the connection count, and updates the user's reputation
     * score and connection count for the event.
     * @param attestation The data structure that contains the attestation information (event ID, type, connection count, etc.)
     * @return bool Returns true if the attestation was successful
     */
    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal override returns (bool) {
        (
            string memory eventId,
            ,
            uint8 connectionCount,
            address[] memory connectedAddresses
        ) = abi.decode(attestation.data, (string, string, uint8, address[]));

        // Ensure the event is valid and exists
        if (s_eventExpirationTimestamps[eventId] == 0)
            revert POCP__EventNotFound();

        // Check if the attestation is within the valid time period of the event
        if (attestation.time > s_eventExpirationTimestamps[eventId])
            revert POCP__EventExpired();

        // Ensure the user hasn't already made an attestation for the event
        if (s_userConnectionsPerEvent[attestation.attester][eventId] != 0)
            revert POCP__AttestationAlreadyExists();

        // Ensure the connected addresses count matches the expected connection count
        if (
            connectedAddresses.length == 0 ||
            connectedAddresses.length != uint256(connectionCount)
        ) {
            revert POCP__InvalidConnectionData();
        }

        // Record the attestation and increase the user's reputation score
        s_userConnectionsPerEvent[attestation.attester][
            eventId
        ] = connectionCount;
        s_userReputation[attestation.attester] += 1;

        return true;
    }

    /**
     * @notice Revocation of attestations is not supported in this contract
     * @return bool Always returns false as revocation is not allowed
     */
    function onRevoke(
        Attestation calldata /*attestation*/,
        uint256 /* value*/
    ) internal pure override returns (bool) {
        return false; // Revocation is not supported
    }

    /**
     * @notice Retrieves the expiration timestamp of a registered event
     * @param eventId The unique identifier of the event
     * @return uint64 The expiration timestamp of the event in Unix format (seconds since the epoch)
     */
    function getEventExpiration(
        string memory eventId
    ) public view returns (uint64) {
        return s_eventExpirationTimestamps[eventId];
    }

    /**
     * @notice Retrieves the number of connections a user has made for a specific event
     * @param user The address of the user
     * @param eventId The unique identifier of the event
     * @return uint8 The number of connections the user has made for the event
     */
    function getUserConnectionCountForEvent(
        address user,
        string memory eventId
    ) public view returns (uint8) {
        return s_userConnectionsPerEvent[user][eventId];
    }

    /**
     * @notice Retrieves the reputation score of a user based on their attestations
     * @param user The address of the user
     * @return uint64 The reputation score of the user
     */
    function getReputationScore(address user) public view returns (uint64) {
        return s_userReputation[user];
    }
}
