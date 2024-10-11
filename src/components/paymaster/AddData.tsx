"use client";
import {
	Transaction,
	TransactionButton,
	TransactionError,
	TransactionResponse,
	TransactionStatus,
	TransactionStatusAction,
	TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { Address, ContractFunctionParameters } from "viem";
import { POCP_ABI, POCP_ADDRESS } from "../../../constants/EAS";

export default function AddData({
	eventId,
}: {
	eventId: string;
}) {
	const contracts = [
		{
			address: POCP_ADDRESS,
			abi: POCP_ABI,
			functionName: "addCheckInData",
			args: [eventId],
		},
	] as unknown as ContractFunctionParameters[];

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
				// Paymaster capabilities added below
				capabilities={{
					paymasterService: {
						url: process.env
							.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
					},
				}}
			>
				<TransactionButton
					className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white]"
					text="Collect"
				/>
				<TransactionStatus>
					<TransactionStatusLabel />
					<TransactionStatusAction />
				</TransactionStatus>
			</Transaction>
		</div>
	);
}
