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

export default function Page() {
	const [eventName, setEventName] = useState("");
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [users, setUsers] = useState<any[]>([]);
	const { toast } = useToast();

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
					createEvent({ users: results.data, eventName }).then(() => {
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
			<div className="w-full flex flex-col justify-center gap-y-6 h-fit py-6">
				<h3 className="text-xl font-bold">Create Event</h3>

				<div>
					<Label>Name</Label>
					<Input
						placeholder="Give a name..."
						value={eventName}
						onChange={(e) => setEventName(e.target.value)}
					/>
				</div>

				<div>
					<Label>Upload Luma event attendee file</Label>
					<FileUploadDropzone onFileUpload={handleFileUpload} />
				</div>

				<Button onClick={handleCreateEvent}>Create Event</Button>
			</div>
			<div className="flex flex-col gap-y-4">
				<h3 className="text-xl font-bold">Participants</h3>
				<Table className="min-w-full table-auto">
					<thead>
						<tr className="bg-gray-200 ">
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
								<tr
									key={index}
									className="border-b text-gray-500"
								>
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
