"use client";

import React from "react";
import {
  Transaction,
  TransactionButton,
  TransactionError,
  TransactionResponse,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import EAS_ABI from "./EAS_ABI.json"; // Ensure you have the EAS contract ABI
import { EAS_ADDRESS, SCHEMA_UID } from "./Constants";

export default function Attest({
  data,
}: {
  data: {
    eventId: string;
    eventType: string;
    connectionCount: number;
    connectedAddresses: string[];
    userAddress: string;
  };
}) {
  // Initialize SchemaEncoder and encode the data
  const schemaEncoder = new SchemaEncoder(
    "string eventId, string eventType, uint8 connectionCount, address[] connectedAddresses"
  );

  const encodedData = schemaEncoder.encodeData([
    { name: "eventId", value: data.eventId, type: "string" },
    { name: "eventType", value: data.eventType, type: "string" },
    { name: "connectionCount", value: data.connectionCount, type: "uint8" },
    {
      name: "connectedAddresses",
      value: data.connectedAddresses,
      type: "address[]",
    },
  ]);

  // Prepare the attestation request
  const attestationRequest = {
    schema: SCHEMA_UID,
    data: {
      recipient: data.userAddress,
      revocable: false,
      data: encodedData,
    },
  };

  // Define the contract interaction
  const contracts = [
    {
      address: EAS_ADDRESS,
      abi: EAS_ABI,
      functionName: "attest",
      args: [attestationRequest],
    },
  ];

  const handleError = (err: TransactionError) => {
    console.error("Transaction error:", err);
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log("Transaction successful", response);
    const newAttestationUID = response.receipt.logs[0].topics[1]; // Adjust based on event logs
    console.log("New attestation UID:", newAttestationUID);
    console.log(
      `Attestation Link https://base-sepolia.easscan.org/attestation/view/${newAttestationUID}`
    );
  };

  return (
    <div>
      <Transaction
        contracts={contracts}
        className="w-[450px]"
        chainId={84532}
        onError={handleError}
        onSuccess={handleSuccess}
        // Paymaster capabilities can be added here if needed
      >
        <TransactionButton
          className="mt-0 mr-auto ml-auto w-fit max-w-full text-white !text-xs font-normal"
          text="Attest"
        />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
