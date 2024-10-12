"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUploadDropzone from "@/components/extension/FileUploadDropzone";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { createEvent } from "@/actions/event.action";
import { Table, TableCaption } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAccount } from "wagmi";
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
import { POCP_ABI, POCP_ADDRESS } from "../../../constants/contract";

export default function Page() {
    const [eventName, setEventName] = useState("");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [created, setCreated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasCalledCreateEvent, setHasCalledCreateEvent] = useState(false); // New state
    const { address } = useAccount();

    const handleFileUpload = (file: File) => {
        setCsvFile(file);
        Papa.parse(file, {
            header: true,
            complete: function (results) {
                setUsers(results.data);
            },
        });
    };

    const contracts = useMemo(() => {
        return [
            {
                address: POCP_ADDRESS,
                abi: POCP_ABI,
                functionName: "addCheckInData",
                args: [eventName],
            },
        ] as unknown as ContractFunctionParameters[];
    }, [eventName]);

    const handleError = (err: TransactionError) => {
        console.error("Transaction error:", err);
    };

    const handleCreateEvent = async () => {
        if (hasCalledCreateEvent || !csvFile || !eventName) {
            return; // Prevent further execution if it's already called
        }

        try {
            Papa.parse(csvFile, {
                header: true,
                complete: function (results) {
                    const users = results.data;

                    const findInstagramKey = (user: any) =>
                        Object.keys(user).find((key) =>
                            key.toLowerCase().includes("instagram")
                        );
                    const findXKey = (user: any) =>
                        Object.keys(user).find(
                            (key) =>
                                key.toLowerCase().includes("twitter") ||
                                key.toLowerCase().includes("x")
                        );

                    setLoading(true);

                    const updatedUsers = users.map((user) => {
                        if (typeof user === "object" && user !== null) {
                            const instagramKey = findInstagramKey(user);
                            const xKey = findXKey(user);
                            return {
                                ...user,
                                instagram: instagramKey
								// @ts-ignore
                                    ? user[instagramKey]
                                    : null,
								// @ts-ignore
                                x: xKey ? user[xKey] : null,
                            };
                        } else {
                            return {};
                        }
                    });

                    createEvent({
                        users: updatedUsers,
                        eventName,
                        slug: eventName.split(" ").join("-"),
                        creator: address || "",
                    }).then(() => {
                        setLoading(false);
                        setCreated(true);
                        setHasCalledCreateEvent(true); // Prevent further calls
                    });
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                    alert("Failed to parse CSV file.");
                },
            });
        } catch (error) {
            console.error("Error creating event or adding users:", error);
            alert("Failed to create event or add participants.");
        }
    };

    // Only trigger the handleCreateEvent when the transaction is successful
    useEffect(() => {
        if (created && !hasCalledCreateEvent) {
            handleCreateEvent();
        }
    }, [created, hasCalledCreateEvent]);

    return (
        <div className="w-full h-full flex flex-col gap-y-6">
            <div className="w-full flex flex-col justify-center gap-y-4 h-fit py-6">
                <h3 className="text-xl font-medium">Add Event</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full flex flex-col gap-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="Give a name..."
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            className="text-white placeholder:text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <Label>Upload Luma event attendee file</Label>
                    <FileUploadDropzone onFileUpload={handleFileUpload} />
                </div>

                <Transaction
                    contracts={contracts}
                    className="w-[450px]"
                    chainId={84532}
                    onError={handleError}
                    onSuccess={() => setCreated(true)} 
                    capabilities={{
                        paymasterService: {
                            url: process.env
                                .NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
                        },
                    }}
                >
                    {created ? (
                        <Link
                            href={`/events/${eventName.split(" ").join("-")}`}
                            className="w-full bg-[#0152FF] hover:bg-[#0152FF] text-white py-3 px-4 rounded-lg text-center"
                        >
                            Go to your event
                        </Link>
                    ) : (
                        eventName &&
                        csvFile &&
                        users.length > 0 && (
                            <TransactionButton
                                className="mt-0 mr-auto ml-auto max-w-full bg-[#0152FF] hover:bg-[#0152FF] text-white"
                                text={loading ? "Loading..." : "Add Attendees"}
                            />
                        )
                    )}
                    <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                    </TransactionStatus>
                </Transaction>
            </div>
            <div className="flex flex-col gap-y-6">
                <h3 className="text-xl font-medium">Participants</h3>
                <Table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-600 bg-opacity-50">
                            {["Name", "Email", "ETH Address"].map(
                                (header, index) => (
                                    <th
                                        key={index}
                                        className="px-4 py-3 text-left font-medium "
                                    >
                                        {header}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 &&
                            users.map((user, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-4">{user.name}</td>
                                    <td className="px-4 py-4">{user.email}</td>
                                    <td className="px-4 py-4">
                                        {user.eth_address || "N/A"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                    {users.length === 0 && (
                        <TableCaption className="py-10 text-center">
                            No participants found
                        </TableCaption>
                    )}
                </Table>
            </div>
        </div>
    );
}
