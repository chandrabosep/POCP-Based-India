"use client";
import {
	acceptRequest,
	getAllRequestsForUser,
	isUserInEvent,
} from "@/actions/event.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";

import { QrReader } from "react-qr-reader";

export default function Profile() {
	const { address } = useAccount();
	const pathname = usePathname();

	const pathSegments = pathname.split("/");
	const eventSlug = pathSegments[2];
	const [scannedData, setScannedData] = useState(null);
	const [isScanning, setIsScanning] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["isUserInEvent", eventSlug, address],
		queryFn: async () => {
			if (!eventSlug || !address) {
				return false;
			}
			return await isUserInEvent(eventSlug, address);
		},
	});

	const { data: requests, isLoading: isLoadingRequests } = useQuery({
		queryKey: ["requests", address],
		queryFn: async () => {
			if (!address) return [];
			return await getAllRequestsForUser(address);
		},
		enabled: !!address,
	});
	console.log(requests);

	const acceptRequestMutation = useMutation({
		mutationFn: (requestId: number) => acceptRequest(requestId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["requests", address] });
		},
	});

	const handleScan = (result: any) => {
		if (result) {
			setScannedData(result?.text || result);
			setIsScanning(false);
		}
	};

	const handleError = (error: any) => {
		console.error("QR scan error:", error);
		setIsScanning(false);
	};

	if (isLoading) {
		return (
			<div className="w-full h-full flex justify-center py-20">
				<Loader2Icon className="w-8 h-8 animate-spin" />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="text-center w-full py-20">
				Kindly connect the wallet you used to register for the event.
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<h1 className="text-xl mb-6">Your QR Code</h1>

			<QRCodeSVG value={address || ""} size={200} />

			{scannedData ? (
				<p className="text-green-500">Scanned Address: {scannedData}</p>
			) : (
				<>
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded"
						onClick={() => setIsScanning(true)}
					>
						Start Scanning
					</button>

					{isScanning && (
						<QrReader
							onResult={(result, error) => {
								if (result) {
									handleScan(result);
								}

								if (error) {
									handleError(error);
								}
							}}
							constraints={{ facingMode: "environment" }}
							style={{ width: "300px" }}
						/>
					)}
				</>
			)}

			<h2 className="text-xl mt-8">Requests</h2>
			{isLoadingRequests ? (
				<Loader2Icon className="w-8 h-8 animate-spin" />
			) : (
				<>
					{requests && requests?.length > 0 ? (
						<ul className="mt-4">
							{requests.map((request) => (
								<li
									key={request.id}
									className="mb-2 flex justify-between"
								>
									<span>
										{request.status === "PENDING"
											? "Pending"
											: "Accepted"}{" "}
										- {request.targetUser.walletAddress}
									</span>
									{request.status === "PENDING" && (
										<button
											className="bg-blue-500 text-white px-2 py-1 rounded"
											onClick={() =>
												acceptRequestMutation.mutate(
													request?.id
												)
											}
										>
											Accept
										</button>
									)}
								</li>
							))}
						</ul>
					) : (
						<p>No requests</p>
					)}
				</>
			)}
		</div>
	);
}
