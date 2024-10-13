"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
	acceptRequest,
	rejectRequest,
	sendRequest,
	getAllRequestsForUser,
	isUserInEvent,
} from "@/actions/event.action";

export default function Profile() {
	const { address } = useAccount();
	const pathname = usePathname();
	const { toast } = useToast();
	const pathSegments = pathname.split("/");
	const eventSlug = pathSegments[2];
	const [scannedData, setScannedData] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Fetch user event information
	const { data, isLoading } = useQuery({
		queryKey: ["isUserInEvent", eventSlug, address],
		queryFn: async () => {
			if (!eventSlug || !address) return false;
			return await isUserInEvent(eventSlug, address);
		},
	});

	// Fetch requests for the user
	const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
		queryKey: ["requests", address],
		queryFn: async () => {
			if (!address) return [];
			return await getAllRequestsForUser(address, eventSlug);
		},
		enabled: !!address,
	});

	const sendRequestMutation = useMutation({
		mutationFn: (targetAddress: string) => {
			return sendRequest({
				senderWallet: address || "",
				targetWallet: targetAddress,
				eventSlug: eventSlug,
			});
		},
		onError: (error) => {
			toast({
				title: "Error sending request",
				description: error.message,
				variant: "destructive",
			});
			setScannedData(null);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["requests", address] });
			scannedData && setScannedData(null);
		},
	});

	const acceptRequestMutation = useMutation({
		mutationFn: (requestId: number) => acceptRequest(requestId, eventSlug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["requests", address] });
		},
	});

	const rejectRequestMutation = useMutation({
		mutationFn: (requestId: number) => rejectRequest(requestId, eventSlug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["requests", address] });
		},
	});

	// Handle QR scan
	const handleScan = (detectedCodes: any) => {
		if (detectedCodes && detectedCodes.length > 0) {
			setScannedData(detectedCodes[0].rawValue || detectedCodes[0].text);
		}
	};

	// Handle QR scan error
	const handleError = (error: any) => {
		if (error) {
			console.error(error);
		}
	};

	if (isLoading) {
		return (
			<div className="w-full h-full flex justify-center py-20">
				<Loader2Icon className="w-8 h-8 animate-spin" />
			</div>
		);
	}

	if (!data || !data.isUserInEvent) {
		return (
			<div className="text-center w-full py-20">
				Kindly connect the wallet you used to register for the event.
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col items-center pt-20">
			<Tabs defaultValue="qr" className="mb-8">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="qr">Generate QR</TabsTrigger>
					<TabsTrigger value="scan">Scan QR</TabsTrigger>
				</TabsList>
				<TabsContent value="qr" className="mt-4 min-w-64 min-h-64">
					<Card>
						<CardHeader>
							<CardTitle>Your QR Code</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center">
							<QRCodeSVG value={address || ""} size={232} />
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent
					value="scan"
					className="mt-4 min-w-[17.8rem] min-h-64"
				>
					<Card>
						<CardHeader>
							<CardTitle>
								{scannedData && scannedData !== address
									? "Scanned Address"
									: "Scan QR Code"}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center mb-2">
							{scannedData && scannedData !== address ? (
								<div className="text-center">
									<p className="mb-4 break-all bg-muted p-2 rounded">
										{scannedData}
									</p>
									<Button
										onClick={() =>
											sendRequestMutation.mutate(
												scannedData
											)
										}
										className="w-full"
									>
										{
											// @ts-ignore
											!sendRequestMutation?.isLoading ? (
												"Send Request"
											) : (
												<Loader2Icon className="mr-1 h-3 w-3 animate-spin" />
											)
										}
									</Button>
								</div>
							) : (
								<div className="size-56">
									<Scanner
										onScan={handleScan}
										onError={handleError}
										constraints={{
											facingMode: "environment",
										}}
										scanDelay={300}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="flex flex-col gap-y-6 py-6 md:w-1/2">
				<h2 className="text-2xl font-semibold text-white">
					Interactions
				</h2>
				<div className="space-y-4 w-full">
					{isLoadingRequests ? (
						<Loader2Icon className="w-8 h-8 animate-spin mx-auto" />
					) : //@ts-ignore
					requestsData?.requests?.length > 0 ? (
						//@ts-ignore
						requestsData.requests.map((request) => {
							const isReceiver =
								request.targetUser.walletAddress === address;
							const isSender =
								request.user.walletAddress === address;

							return (
								<div
									key={request.id}
									className="overflow-hidden w-full"
								>
									<div className="w-full max-w-6xl">
										<div className="flex justify-between items-start">
											<div className="flex gap-x-2 md:gap-x-4">
												<p className="md:text-xl">🤝</p>
												<div className="flex flex-col gap-y-1">
													<h3 className="text-base md:text-2xl font-medium text-white max-w-xs">
														You met with{" "}
														{isSender
															? request.targetUser
																	.name
															: request.user.name}
													</h3>
													<p className="text-white/40 text-sm">
														{new Date(
															request.createdAt
														).toLocaleString(
															"en-US",
															{
																weekday: "long",
																year: "numeric",
																month: "long",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															}
														)}
													</p>
												</div>
											</div>

											<div className="flex gap-x-4 items-center justify-center pt-2">
												{/* Only show Accept/Reject for the target user if the request is PENDING */}
												{isReceiver &&
													request.status ===
														"PENDING" && (
														<div className="flex gap-y-2 md:flex-row space-x-2">
															<Button
																onClick={() =>
																	acceptRequestMutation.mutate(
																		request.id
																	)
																}
																variant="outline"
																size="sm"
																className="text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-100"
															>
																Accept
															</Button>
															<Button
																onClick={() =>
																	rejectRequestMutation.mutate(
																		request.id
																	)
																}
																variant="outline"
																size="sm"
																className="text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-100"
															>
																Reject
															</Button>
														</div>
													)}

												{/* Only show "Pending" for the sender */}
												{isSender &&
													request.status ===
														"PENDING" && (
														<div className="text-sm text-yellow-600">
															Pending
														</div>
													)}

												{/* Show request status if already accepted/rejected */}
												{request.status !==
													"PENDING" && (
													<div
														className={`p-1 px-5 rounded-full border capitalize flex items-center font-semibold text-sm md:text-base ${
															request.status ===
															"ACCEPTED"
																? "bg-green-100 text-green-800 border-green-500"
																: request.status ===
																  "REJECTED"
																? "bg-red-100 text-red-800 border-red-500"
																: "bg-gray-100 text-gray-800 border-gray-500"
														}`}
													>
														{request.status}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})
					) : (
						<div className="flex items-center justify-center">
							No requests yet
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
