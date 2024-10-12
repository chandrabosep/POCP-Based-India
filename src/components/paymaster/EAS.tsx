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
import { POCP_ABI, POCP_ADDRESS } from "../../../constants/contract";

export default function Attest({ eventId }: { eventId: string }) {
	const contracts = [
		{
			address: POCP_ADDRESS,
			abi: POCP_ABI,
			functionName: "improveReputation",
			args: [eventId],
		},
	];

	const handleError = (err: TransactionError) => {
		console.error("Transaction error:", err);
	};

	const handleSuccess = (response: TransactionResponse) => {
		console.log("Transaction successful", response);
	};

	return (
		<div>
			<Transaction
				contracts={contracts}
				className="w-[450px]"
				chainId={84532}
				onError={handleError}
				onSuccess={handleSuccess}
				capabilities={{
					paymasterService: {
						url: process.env
							.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
					},
				}}
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
