import { ethers } from "ethers";
import { EAS as EAS150, NO_EXPIRATION, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import dotenv from 'dotenv';

dotenv.config();


const provider = new ethers.JsonRpcProvider(
    `${process.env.BASE_SEPOLIA_RPC_URL}`
);

export const signer = new ethers.Wallet(process.env.CB_PRIVATE_KEY, provider);
export const cbAddress = signer.getAddress();

export const SCHEMA_UID =
    "0xcd5b9b350becaac23674d693f29c080208aec287077e1c216b0d6023c7512e6f";

export const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";

// Contracts
export const POCP_ADDRESS = "0x60D05DecD0D4c4Dc3D63cd857E7643b0071d3cb0";

export const POCP_ABI = [{ "inputs": [{ "internalType": "contract IEAS", "name": "_eas", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AccessDenied", "type": "error" }, { "inputs": [], "name": "InsufficientValue", "type": "error" }, { "inputs": [], "name": "InvalidEAS", "type": "error" }, { "inputs": [], "name": "InvalidLength", "type": "error" }, { "inputs": [], "name": "NotPayable", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [], "name": "POCP__EventExpired", "type": "error" }, { "inputs": [], "name": "POCP__EventNotFound", "type": "error" }, { "inputs": [], "name": "POCP__InvalidConnectionData", "type": "error" }, { "inputs": [], "name": "POCP__InvalidEventId", "type": "error" }, { "inputs": [], "name": "POCP__InvalidOwner", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [{ "internalType": "string", "name": "eventId", "type": "string" }], "name": "addCheckInData", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation", "name": "attestation", "type": "tuple" }], "name": "attest", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "eventId", "type": "string" }], "name": "getEventExpiration", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getReputationScore", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "eventId", "type": "string" }], "name": "improveReputation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isPayable", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation[]", "name": "attestations", "type": "tuple[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "multiAttest", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation[]", "name": "attestations", "type": "tuple[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "multiRevoke", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation", "name": "attestation", "type": "tuple" }], "name": "revoke", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]



// Contract instances with provider and signer configurations
export const pocpContract = new ethers.Contract(POCP_ADDRESS, POCP_ABI, signer);



const schemaEncoder = new SchemaEncoder(
    "string eventId, string eventType, uint8 connectionCount, address[] connectedAddresses"
);

export const encodedData = (eventData, userData) => {
    const encodedData = schemaEncoder.encodeData([
        { name: "eventId", value: eventData.eventId, type: "string" },
        {
            name: "eventType",
            value: eventData.eventType,
            type: "string",
        },
        {
            name: "connectionCount",
            value: userData.connectionCount,
            type: "uint8",
        },
        { name: "connectedAddresses", value: userData.connectedAddresses, type: "address[]" },
    ])
    return encodedData;
}