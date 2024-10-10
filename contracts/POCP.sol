// SPDX-License-Identifier: mujahid002
pragma solidity ^0.8.20;

import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error POCP__InvalidInput();

/// @custom:security-contact mujahidshaik2002@gmail.com
contract POCP is SchemaResolver, Ownable {
    constructor(
        IEAS _eas,
        address _nounContractAddress
    ) SchemaResolver(_eas) Ownable(_msgSender()) {}

    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal pure override returns (bool) {
        return true;
    }

    function onRevoke(
        Attestation calldata /*attestation*/,
        uint256 /* tNounId*/
    ) internal pure override returns (bool) {
        return false;
    }
}
