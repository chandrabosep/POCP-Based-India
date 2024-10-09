"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; 
import { getAllRequestsForEvent } from "@/actions/event.action";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

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
		<div className="container mx-auto flex flex-col gap-y-6 py-4 h-[calc(100vh-5rem)]">
			<Card className="flex-1 overflow-hidden">
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
										<Skeleton className="w-[20px] h-[20px] rounded-full" />
										<Skeleton className="h-[40px] w-[40px] rounded-full" />
										<div className="flex-1">
											<Skeleton className="w-[150px] h-[20px] rounded-full" />
											<Skeleton className="w-[100px] h-[16px] mt-2 rounded-full" />
										</div>
										<Skeleton className="w-[50px] h-[20px] rounded-full" />
									</li>
							  ))
							: sortedUsers?.map((user, index) => (
									<li
										key={user.id}
										className="flex items-center space-x-6"
									>
										<p className="font-semibold text-gray-600 tracking-widest">
											#{index + 1}
										</p>
										<Avatar className="size-10">
											<AvatarImage
												src={`/placeholder.svg?text=${user.name.charAt(
													0
												)}`}
												alt={user.name}
											/>
											<AvatarFallback>
												{user.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<h3 className="font-semibold">
												{user.name}
											</h3>
											<p className="text-sm text-muted-foreground">
												{user.email}
											</p>
										</div>
										<div className="text-right bg-gray-100 p-2 rounded-md">
											<p className="font-bold">
												{user.connections || 0}
											</p>
										</div>
									</li>
							  ))}
					</ul>
				</CardContent>
			</Card>

			<Card className="mt-auto">
				<CardHeader>
					<CardTitle className="text-xl font-semibold">
						Your Rank
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center space-x-4">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="flex-1">
								<Skeleton className="w-[120px] h-[20px] rounded-full" />
								<Skeleton className="w-[180px] h-[16px] mt-2 rounded-full" />
							</div>
							<Skeleton className="w-[50px] h-[20px] rounded-full" />
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
								<AvatarFallback>
									{currentUser?.name?.charAt(0) || "?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<p className="font-medium">{currentUser?.name}</p>
								<p className="text-sm text-muted-foreground">
									{currentUser?.email}
								</p>
							</div>
							<div className="text-right bg-gray-100 p-2 rounded-md">
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
