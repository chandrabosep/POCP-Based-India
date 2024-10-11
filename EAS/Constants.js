import { ethers } from "ethers";

export const SCHEMA_UID =
    "0x476bc7c4da036d6e0d9226d4e96df6e34cab22d1194ff976e145ca4c34fae7cc";

export const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";

// Contracts
export const POCP_ADDRESS = "0x9FA0Fc7360f19546101c3A3794C42363C5e1c335";

export const POCP_ABI = [{ "inputs": [{ "internalType": "contract IEAS", "name": "_eas", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AccessDenied", "type": "error" }, { "inputs": [], "name": "InsufficientValue", "type": "error" }, { "inputs": [], "name": "InvalidEAS", "type": "error" }, { "inputs": [], "name": "InvalidLength", "type": "error" }, { "inputs": [], "name": "NotPayable", "type": "error" }, { "inputs": [], "name": "POCP__AttestationAlreadyExists", "type": "error" }, { "inputs": [], "name": "POCP__EventExpired", "type": "error" }, { "inputs": [], "name": "POCP__EventNotFound", "type": "error" }, { "inputs": [], "name": "POCP__InvalidConnectionData", "type": "error" }, { "inputs": [], "name": "POCP__InvalidEventId", "type": "error" }, { "inputs": [{ "internalType": "string", "name": "eventId", "type": "string" }], "name": "addCheckInData", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation", "name": "attestation", "type": "tuple" }], "name": "attest", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "eventId", "type": "string" }], "name": "getEventExpiration", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getReputationScore", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "eventId", "type": "string" }], "name": "getUserConnectionCountForEvent", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isPayable", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation[]", "name": "attestations", "type": "tuple[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "multiAttest", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation[]", "name": "attestations", "type": "tuple[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "multiRevoke", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "uid", "type": "bytes32" }, { "internalType": "bytes32", "name": "schema", "type": "bytes32" }, { "internalType": "uint64", "name": "time", "type": "uint64" }, { "internalType": "uint64", "name": "expirationTime", "type": "uint64" }, { "internalType": "uint64", "name": "revocationTime", "type": "uint64" }, { "internalType": "bytes32", "name": "refUID", "type": "bytes32" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "attester", "type": "address" }, { "internalType": "bool", "name": "revocable", "type": "bool" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct Attestation", "name": "attestation", "type": "tuple" }], "name": "revoke", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]


export const initializeProvider = () => {
    if (typeof window === "undefined") {
        console.warn(
            "initializeProvider: Window object not available on the server."
        );
        return null;
    }

    const ethereum = window.ethereum;

    if (ethereum) {
        return new ethers.BrowserProvider(ethereum);
    } else {
        console.warn("initializeProvider: Web3Provider not available.");
        return null;
    }
};

export const provider =
    typeof window !== "undefined" ? initializeProvider() : null;

export const getSigner = async () => {
    if (provider) {
        return await provider.getSigner();
    }
    return null;
};

export const signer = await getSigner();

// Contract instances with provider and signer configurations
export const pocpContractWithProvider = provider
    ? new ethers.Contract(POCP_ADDRESS, POCP_ABI, provider)
    : null;

export const pocpContractWithSigner = signer
    ? new ethers.Contract(POCP_ADDRESS, POCP_ABI, signer)
    : null;

// Contract instances connected with signer
export const pocpContract = pocpContractWithSigner
    ? pocpContractWithSigner.connect(signer)
    : null;
