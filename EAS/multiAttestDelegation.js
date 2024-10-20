import {
    EAS as EAS150,
    NO_EXPIRATION,
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { eventData } from "./data.js"

import {
    EAS_ADDRESS,
    SCHEMA_UID,
    POCP_ADDRESS,
    signer,
    encodedData,
} from "./Constants.js";

export const multiAttest = async (dataArray) => {
    try {
        if (!dataArray) {
            throw new Error("Invalid input parameters");
        }
        const eas = new EAS150(EAS_ADDRESS);

        let res = [];

        console.log("encodedData for 1st item", encodedData(eventData, dataArray[0]))


        for (let i = 0; i < dataArray.length; i++) {


            // Generate encodedData for each item
            const data = dataArray[i];
            const encodedDataForItem = encodedData(eventData, data);

            // If you need to connect with a different signer, provide the signer object
            eas.connect(data.userAddress);
            const delegated = await eas.getDelegated();


            const response = await delegated.signDelegatedAttestation(
                {
                    schema: SCHEMA_UID,
                    recipient: data.userAddress,
                    expirationTime: NO_EXPIRATION,
                    revocable: false,
                    refUID:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                    data: encodedDataForItem,
                    deadline: NO_EXPIRATION,
                },
                signer
            );
            res.push(response);
        }

        let trx = [];
        for (let i = 0; i < dataArray.length; i++) {
            // Generate encodedData for each item
            const data = dataArray[i];
            const encodedDataForItem = encodedData(eventData, data);

            const transaction = await eas.attestByDelegation({
                schema: SCHEMA_UID,
                data: {
                    recipient: data.userAddress,
                    expirationTime: NO_EXPIRATION,
                    revocable: false, // Ensure consistency with the previous flag
                    refUID:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                    data: encodedDataForItem,
                },
                signature: res[i].signature,
                attester: await signer.getAddress(),
            });

            const newAttestationUID = await transaction.wait();
            trx.push(newAttestationUID);
        }

        console.log("New attestation UIDs:", trx);
        trx.forEach((uid) => {
            console.log(
                `Attestation Link https://base-sepolia.easscan.org/attestation/view/${uid}`
            );
        });

        return trx; // Return the array of UIDs if needed
    } catch (error) {
        console.error("Unable to run OnChain Attest: ", error);
        throw error; // Rethrow the error for handling in the calling function
    }
};
