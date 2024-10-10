"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import FileUploadDropzone from "@/components/extension/FileUploadDropzone";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { createEvent } from "@/actions/event.action";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export default function Page() {
	const [eventName, setEventName] = useState("");
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [users, setUsers] = useState<any[]>([]);
	const [created, setCreated] = useState(false);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();
	const { address } = useAccount();
	const [date, setDate] = useState<Date>();

	const handleFileUpload = (file: File) => {
		setCsvFile(file);
		Papa.parse(file, {
			header: true,
			complete: function (results) {
				setUsers(results.data);
			},
		});
	};

	const handleCreateEvent = async () => {
		if (!csvFile || !eventName) {
			alert("Please provide event name and upload a CSV file");
			return;
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
									? // @ts-ignore
									  user[instagramKey]
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
						date,
					}).then(() => {
						setCreated(true);
						setLoading(false);
						toast({
							title: "Event created successfully",
							description:
								"Event has been created successfully🎉",
						});
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
					<div className="flex flex-col gap-2">
						<Label>Date</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-[280px] justify-start text-left font-normal bg-transparent hover:bg-transparent text-white hover:text-white",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? (
										new Date(date).toLocaleDateString(
											"en-GB",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
											}
										)
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={date}
									onSelect={setDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="space-y-2 pt-4">
					<Label>Upload Luma event attendee file</Label>
					<FileUploadDropzone onFileUpload={handleFileUpload} />
				</div>

				{created ? (
					<Link
						href={`/events/${eventName.split(" ").join("-")}`}
						className="w-full"
					>
						<Button className="w-full bg-[#0152FF] hover:bg-[#0152FF] text-white">
							Go to your event
						</Button>
					</Link>
				) : (
					<Button
						onClick={handleCreateEvent}
						className="bg-[#0152FF] hover:bg-[#0152FF] text-white"
					>
						{loading ? "Loading..." : "Add Attendees"}
					</Button>
				)}
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
