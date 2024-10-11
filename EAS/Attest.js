import {
    EAS as EAS150,
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

import {
    EAS_ADDRESS,
    SCHEMA_UID,
    POCP_ADDRESS,
    signer,
} from "./Constants.js";

export const attest = async (data) => {
    try {
        if (!data) {
            throw new Error("Invalid input parameters");
        }

        // Initialize EAS instance
        const eas = new EAS150(EAS_ADDRESS);

        // Connect signer to EAS instance
        eas.connect(signer);


        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new SchemaEncoder(
            "string eventId, string eventType, uint8 connectionCount, address[] connectedAddresses"
        );
        const encodedData = schemaEncoder.encodeData([
            { name: "eventId", value: data.eventId, type: "string" },
            {
                name: "eventType",
                value: data.eventType,
                type: "string",
            },
            {
                name: "connectionCount",
                value: data.connectionCount,
                type: "uint8",
            },
            { name: "connectedAddresses", value: data.connectedAddresses, type: "address[]" },
        ]);

        // Attest the data
        const trx = await eas.attest({
            schema: SCHEMA_UID,
            data: {
                recipient: data.userAddress,
                revocable: false,
                data: encodedData,
            },
        });
        const newAttestationUID = await trx.wait();

        console.log("New attestation UID:", newAttestationUID);

        console.log(`Attestation Link https://base-sepolia.easscan.org/attestation/view/${newAttestationUID}`);



        return false;
    } catch (error) {
        console.error("Unable to run OnChain Attest: ", error);
        throw error; // Rethrow the error for handling in the calling function
    }
};