"use client";

import React, { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import ShareButtons from "../ShareBtns";
import { Button } from "../ui/button";

export default function Attest({ eventId }: { eventId: string }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSuccessHandled, setIsSuccessHandled] = useState(false); // New flag for success handling

    const contracts = [
        {
            address: POCP_ADDRESS as `0x${string}`,
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

        // Only open the dialog if success hasn't been handled yet
        if (!isSuccessHandled) {
            setIsDialogOpen(true);
            setIsSuccessHandled(true); // Set the flag to prevent future dialogs
        }
    };

    return (
        <div>
            <Transaction
                // @ts-ignore
                contracts={contracts}
                className="w-[450px]"
                chainId={84532}
                onError={handleError}
                onSuccess={handleSuccess}
                capabilities={{
                    paymasterService: {
                        url: process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl bg-gradient-to-b from-blue-800 to-blue-700 text-foreground ring-0 border-0 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primaryColor">
                            Your reputation has improved
                        </DialogTitle>
                        <div className="flex flex-col gap-y-3 items-center justify-center py-5">
                            <p>
                                Continue networking and increase your on-chain score through Base using POCP.
                            </p>
                            <Image
                                src="/logo.jpeg"
                                alt="Chiliz"
                                width={1000}
                                height={1000}
                                className="w-2/3 rounded-xl"
                            />
                            <ShareButtons />
                        </div>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="bg-gray-500 bg-opacity-50 backdrop-contrast-100 backdrop-filter  backdrop-blur border border-white/20 py-4"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cool
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
