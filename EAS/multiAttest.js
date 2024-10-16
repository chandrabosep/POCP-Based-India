import {
    EAS as EAS150,
    NO_EXPIRATION,
    SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { eventData } from "./data.js";

import {
    EAS_ADDRESS,
    SCHEMA_UID,
    POCP_ADDRESS,
    signer,
    encodedData,
} from "./Constants.js";

export const multiAttest = async (dataArray) => {
    try {
        // Validate input
        if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
            throw new Error("Invalid or empty dataArray");
        }

        const eas = new EAS150(EAS_ADDRESS);

        // Connect the signer to EAS
        eas.connect(signer);

        let res = [];

        for (let i = 0; i < dataArray.length; i++) {
            const data = dataArray[i];

            // Ensure necessary data exists
            if (!data || !data.userAddress) {
                throw new Error(`Missing required data at index ${i}`);
            }

            // Generate encoded data for each item
            const encodedDataForItem = encodedData(eventData, data);

            // Prepare the response object for the multiAttest request
            const response = {
                recipient: data.userAddress,
                revocable: false,
                data: encodedDataForItem,
            };

            res.push(response);
        }

        // console.log("THE DATA", res)
        // return

        // Perform multiAttest on-chain transaction
        const trx = await eas.multiAttest([{
            schema: SCHEMA_UID,
            data: res,
        }]);

        console.log("New attestation UIDs:", trx);

        // If you'd like to log attestation links
        // trx.forEach((uid) => {
        //     console.log(`Attestation Link: https://base-sepolia.easscan.org/attestation/view/${uid}`);
        // });

        return trx; // Return the transaction result to the calling function

    } catch (error) {
        console.error("Unable to run OnChain Attest:", error.message);
        throw error; // Rethrow for external handling
    }
};
