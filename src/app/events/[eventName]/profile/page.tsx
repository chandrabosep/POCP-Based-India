"use client";
import {
	acceptRequest,
	getAllRequestsForUser,
	isUserInEvent,
	rejectRequest,
	sendRequest,
} from "@/actions/event.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2, Loader2Icon, XCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
	const { address } = useAccount();
	const pathname = usePathname();
	const { toast } = useToast();
	const pathSegments = pathname.split("/");
	const eventSlug = pathSegments[2];
	const [scannedData, setScannedData] = useState(null);
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
			return await getAllRequestsForUser(address, eventSlug);
		},
		enabled: !!address,
	});

	const { mutate: sendRequestMutation, isPending } = useMutation({
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
			queryClient.invalidateQueries({
				queryKey: ["requests", address],
			});
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

	const handleScan = (detectedCodes: any) => {
		if (detectedCodes && detectedCodes.length > 0) {
			setScannedData(detectedCodes[0].rawValue || detectedCodes[0].text);
		}
	};

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

	if (!data || !data?.isUserInEvent) {
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
								{scannedData && scannedData != address
									? "Scanned Address"
									: "Scan QR Code"}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center mb-2">
							{scannedData && scannedData != address ? (
								<div className="text-center">
									<p className="mb-4 break-all bg-muted p-2 rounded">
										{scannedData}
									</p>
									<Button
										onClick={() => {
											sendRequestMutation(scannedData);
										}}
										className="w-full"
									>
										{!isPending ? (
											"Send Request"
										) : (
											<Loader2 className="mr-1 h-3 w-3 animate-spin" />
										)}
									</Button>
								</div>
							) : (
								<>
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
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<h2 className="text-2xl font-bold mb-4 text-primary">Requests</h2>
			<div className="space-y-4">
				{requests &&
					requests.map((request) => (
						<Card key={request.id} className="overflow-hidden">
							<CardContent className="p-4 flex justify-between items-center gap-x-8">
								<div className="overflow-hidden">
									<p
										className="font-semibold truncate"
										title={
											request.targetUser.walletAddress ||
											""
										}
									>
										Address:{" "}
										{request.targetUser.walletAddress}
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Badge
										variant={
											request.status === "PENDING"
												? "secondary"
												: request.status === "ACCEPTED"
												? "default"
												: "destructive"
										}
										className="h-8"
									>
										{request.status === "ACCEPTED" && (
											<CheckCircle className="mr-1 h-3 w-3" />
										)}
										{request.status === "REJECTED" && (
											<XCircle className="mr-1 h-3 w-3" />
										)}
										{request.status}
									</Badge>
									{request.status === "PENDING" && (
										<div className="flex space-x-2">
											<Button
												onClick={() =>
													acceptRequestMutation.mutate(
														request?.id
													)
												}
												variant="outline"
												size="sm"
												className="text-green-600 hover:text-green-700 hover:bg-green-50"
											>
												Accept
											</Button>
											<Button
												onClick={() =>
													rejectRequestMutation.mutate(
														request?.id
													)
												}
												variant="outline"
												size="sm"
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
											>
												Reject
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
			</div>
		</div>
	);
}
