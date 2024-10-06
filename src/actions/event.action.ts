"use server";

import prisma from "@/lib/db";

export const createEvent = async ({ users, eventName, slug }: any) => {
	try {
		// Step 1: Create the event
		console.log(
			"**************************************************************************"
		);
		const newEvent = await prisma.event.create({
			data: {
				name: eventName,
				slug,
			},
		});
		for (const userData of users) {
			const { name, email, eth_address: walletAddress } = userData;

			// Step 3: Find or create the user
			let user = await prisma.user.findUnique({
				where: {
					email: email,
				},
			});

			if (!user) {
				user = await prisma.user.create({
					data: {
						name,
						email,
						walletAddress,
					},
				});
			}

			await prisma.eventUser.create({
				data: {
					userId: user.id,
					eventId: newEvent.id,
				},
			});
		}

		console.log("Event and users successfully created and linked!");
	} catch (error) {
		console.error("Error creating event or adding users:", error);
	}
};

export const isUserInEvent = async (
	eventSlug: string,
	walletAddress: string
) => {
	try {
		const userInEvent = await prisma.eventUser.findFirst({
			where: {
				Event: {
					slug: eventSlug,
				},
				User: {
					walletAddress: walletAddress,
				},
			},
			select: {
				userId: true,
			},
		});
		return !!userInEvent;
	} catch (error) {
		console.error("Error checking if user is in the event:", error);
		throw error;
	}
};

export const sendRequest = async (
	senderWallet: string,
	targetWallet: string
) => {
	try {
		// Find sender and target users by wallet addresses
		const sender = await prisma.user.findUnique({
			where: { walletAddress: senderWallet },
		});
		const target = await prisma.user.findUnique({
			where: { walletAddress: targetWallet },
		});

		if (!sender || !target)
			throw new Error("Sender or target user not found");

		// Create the request
		const request = await prisma.request.create({
			data: {
				userId: sender.id,
				targetUserId: target.id, // Assuming you'll add targetUserId field in Request model
				status: "PENDING",
			},
		});
		return request;
	} catch (error) {
		console.error("Error sending request:", error);
		throw error;
	}
};

export const acceptRequest = async (requestId: number) => {
	try {
		// Update request status to 'ACCEPTED'
		const acceptedRequest = await prisma.request.update({
			where: { id: requestId },
			data: { status: "ACCEPTED" },
		});
		return acceptedRequest;
	} catch (error) {
		console.error("Error accepting request:", error);
		throw error;
	}
};

export const rejectRequest = async (requestId: number) => {
	try {
		// Update request status to 'REJECTED'
		const rejectedRequest = await prisma.request.update({
			where: { id: requestId },
			data: { status: "REJECTED" },
		});
		return rejectedRequest;
	} catch (error) {
		console.error("Error rejecting request:", error);
		throw error;
	}
};

export const getAllRequestsForUser = async (walletAddress: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: { walletAddress: walletAddress }, // Ensure it's case-insensitive
			select: { id: true },
		});

		console.log("User found:", user);

		if (!user) {
			throw new Error("User not found");
		}

		const requests = await prisma.request.findMany({
			where: {
				OR: [{ userId: user.id }, { targetUserId: user.id }],
			},
			include: {
				user: {
					select: { walletAddress: true, name: true },
				},
				targetUser: {
					select: { walletAddress: true, name: true },
				},
			},
		});

		console.log("Requests found:", requests);

		return requests;
	} catch (error: any) {
		console.error("**************Error fetching requests:", error.message);
	}
};
