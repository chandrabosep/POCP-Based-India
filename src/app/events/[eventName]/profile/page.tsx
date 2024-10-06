"use client";
import { isUserInEvent } from "@/actions/event.action";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import { useAccount } from "wagmi";

export default function Profile() {
	const { address } = useAccount();
	const pathname = usePathname();

	const pathSegments = pathname.split("/");
	const eventSlug = pathSegments[2];

	const { data, isLoading } = useQuery({
		queryKey: ["isUserInEvent", eventSlug, address],
		queryFn: async () => {
			if (!eventSlug || !address) {
				return false;
			}
			return await isUserInEvent(eventSlug, address);
		},
	});

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

	return <div className="w-full h-full flex justify-center">page</div>;
}
