"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllRequestsForEvent } from "@/actions/event.action";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Leaderboard() {
	const { address } = useAccount();
	const pathname = usePathname();
	const pathSegments = pathname.split("/");
	const eventSlug = pathSegments[2];

	const { data, isLoading, isError } = useQuery({
		queryKey: ["requests", eventSlug],
		queryFn: () => getAllRequestsForEvent(eventSlug, address || ""),
		enabled: !!address,
		refetchInterval: 10000,
	});

	if (isError) return <div>Failed to load leaderboard</div>;

	const { users, currentUser } = data || {};
	const sortedUsers = users?.sort((a, b) => b.connections - a.connections);

	return (
		<div className="container mx-auto flex flex-col gap-y-6 py-4 h-[calc(100vh-5rem)]  text-white">
			<Card className="flex-1 overflow-hidden bg-gray-500 bg-opacity-40  text-white border-white/25">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Leaderboard
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-y-auto h-full">
					<ul className="flex flex-col gap-y-6">
						{isLoading
							? Array.from({ length: 5 }).map((_, index) => (
									<li
										key={index}
										className="flex items-center space-x-6"
									>
										<Skeleton className="bg-white/50 w-[20px] h-[20px] rounded-full" />
										<Skeleton className="bg-white/50 h-[40px] w-[40px] rounded-full" />
										<div className="flex-1">
											<Skeleton className="bg-white/50 w-[150px] h-[20px] rounded-full" />
											<Skeleton className="bg-white/50 w-[100px] h-[16px] mt-2 rounded-full" />
										</div>
										<Skeleton className="bg-white/50 w-[50px] h-[20px] rounded-full" />
									</li>
							  ))
							: sortedUsers?.map((user, index) => (
									<li
										key={user.id}
										className="flex items-center space-x-6"
									>
										<p className="font-semibold tracking-widest">
											#{index + 1}
										</p>
										<Avatar className="size-10">
											<AvatarImage
												src={`/placeholder.svg?text=${user.name.charAt(
													0
												)}`}
												alt={user.name}
											/>
											<AvatarFallback className="text-black">
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<h3 className="font-semibold">
												{user.name}
											</h3>
											<p className="text-sm text-white/40">
												{user.email}
											</p>
										</div>
										<div className="text-right bg-gray-100 text-black p-2 rounded-md">
											<p className="font-bold">
												{user.connections || 0}
											</p>
										</div>
									</li>
							  ))}
					</ul>
				</CardContent>
			</Card>

			<Card className="bg-gray-500 bg-opacity-40  text-white border-white/25 mt-auto">
				<CardHeader className="p-6 flex flex-row justify-between items-center">
					<CardTitle className="text-xl font-semibold flex justify-between">
						Your Rank
					</CardTitle>
					<Button className="bg-white text-black	hover:bg-white hover:text-black font-medium" onClick={() => {}}>
						Attest your connections
					</Button>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center space-x-4">
							<Skeleton className="bg-white/50 h-12 w-12 rounded-full" />
							<div className="flex-1">
								<Skeleton className="bg-white/50 w-[120px] h-[20px] rounded-full" />
								<Skeleton className="bg-white/50 w-[180px] h-[16px] mt-2 rounded-full" />
							</div>
							<Skeleton className="bg-white/50 w-[50px] h-[20px] rounded-full" />
						</div>
					) : (
						<div className="flex items-center space-x-4">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={`/placeholder.svg?text=${currentUser?.name?.charAt(
										0
									)}`}
									alt={currentUser?.name || "Your Avatar"}
								/>
								<AvatarFallback className="text-black">
									{currentUser?.name?.charAt(0) || "?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="font-medium">
									{currentUser?.name}
								</p>
								<p className="text-sm text-white/40">
									{currentUser?.email}
								</p>
							</div>
							<div className="text-right bg-gray-100 text-black p-2 rounded-md">
								<p className="font-bold">
									{currentUser?.connections || 0}
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}