// SPDX-License-Identifier: mujahid002
pragma solidity ^0.8.20;

import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error POCP__InvalidInput();

/// @custom:security-contact mujahidshaik2002@gmail.com
contract POCP is SchemaResolver, Ownable {
    mapping(address => mapping(string => uint8))
        private s_userEventAttestations;
    mapping(address => uint256) private s_reputationScores;

    constructor(
        IEAS _eas,
        address _nounContractAddress
    ) SchemaResolver(_eas) Ownable(_msgSender()) {}

    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal override returns (bool) {
        (
            string memory eventId,
            string memory eventType,
            uint64 eventTimestamp,
            uint8 connectionCount,
            address[] memory connectedAddresses
        ) = abi.decode(
                attestation.data,
                (string, string, uint64, uint8, address[])
            );
        if (s_userEventAttestations[attestation.attester][eventId] != 0)
            revert();
        if (block.timestamp <= uint256(eventTimestamp) + 24 hours) revert();
        if (
            connectedAddresses.length == 0 ||
            connectedAddresses.length != uint256(connectionCount)
        ) revert();

        s_userEventAttestations[attestation.attester][
            eventId
        ] = connectionCount;
        s_reputationScores[attestation.attester] += uint256(connectionCount);
        return true;
    }

    function onRevoke(
        Attestation calldata /*attestation*/,
        uint256 /* value*/
    ) internal pure override returns (bool) {
        return false;
    }
}
