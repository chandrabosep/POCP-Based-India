// SPDX-License-Identifier: mujahid002
pragma solidity ^0.8.20;

import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// Custom Errors for better gas efficiency and clarity
error POCP__InvalidEventId(); // Triggered when an invalid event ID is provided
error POCP__InvalidConnectionData(); // Triggered when the connection data in an attestation is invalid
error POCP__EventNotFound(); // Triggered when an event is not found
error POCP__EventExpired(); // Triggered when an event has expired
error POCP__InvalidOwner(); // Triggered when the invalid owner creates attestation

/**
 * @title POCP - Proof of Connection Protocol
 * @author mujahid002
 * @notice This contract implements a Proof of Connection Protocol, where users can register for events,
 * improve their reputation scores, and verify attestations using the Ethereum Attestation Service (EAS) on Base.
 * @dev Inherits from SchemaResolver for attestation verification and Ownable for ownership control.
 * @custom:security-contact mujahidshaik2002@gmail.com
 */
contract POCP is SchemaResolver, Ownable {
    /// @notice Maps an event's unique identifier to its expiration timestamp
    mapping(string => uint64) private s_eventExpirationTimestamps;

    /// @notice Maps a user's address to their reputation score
    mapping(address => uint64) private s_userReputation;

    /**
     * @dev Initializes the contract with the attestation schema resolver and ownership
     * @param _eas The Ethereum Attestation Service contract address used for attestations
     */
    constructor(IEAS _eas) SchemaResolver(_eas) Ownable(_msgSender()) {}

    /**
     * @notice Registers an event by its unique identifier and sets its expiration time to 24 hours from the current block timestamp
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
     * @notice Allows a user to improve their reputation by interacting with an event
     * @dev The event must still be valid (i.e., not expired) for the reputation to be improved.
     * @param eventId The unique identifier of the event in which the user participated.
     */
    function improveReputation(string memory eventId) public {
        if (s_eventExpirationTimestamps[eventId] < uint64(block.timestamp))
            revert POCP__EventExpired();
        s_userReputation[_msgSender()] += 1;
    }

    /**
     * @notice Verifies the attestation data during the attestation process
     * @dev Called internally during attestation by Multi Attest Owner, ensures the event is valid and the connection data is correct.
     */
    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal view override returns (bool) {
        if (attestation.attester != owner()) revert POCP__InvalidOwner();
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

        // Ensure the connected addresses count matches the expected connection count
        if (
            connectedAddresses.length == 0 ||
            connectedAddresses.length != uint256(connectionCount)
        ) {
            revert POCP__InvalidConnectionData();
        }

        return true;
    }

    /**
     * @notice Revocation of attestations is not supported in this contract
     * @dev This contract does not allow revoking attestations.
     * @return bool Always returns false as revocation is not allowed.
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
     * @return uint64 The expiration timestamp of the event in Unix time (seconds since the epoch)
     * @custom:error POCP__EventNotFound is triggered when the event does not exist.
     */
    function getEventExpiration(
        string memory eventId
    ) public view returns (uint64) {
        if (s_eventExpirationTimestamps[eventId] == 0)
            revert POCP__EventNotFound();
        return s_eventExpirationTimestamps[eventId];
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
