"use server";

import prisma from "@/lib/db";

export const createEvent = async ({
	users,
	eventName,
	slug,
	creator,
}: // date,
any) => {
	try {
		// Step 1: Create the event
		console.log(
			"**************************************************************************"
		);
		const newEvent = await prisma.event.create({
			data: {
				name: eventName,
				slug,
				creator,
				// date,
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
				eventId: true,
			},
		});
		return {
			isUserInEvent: !!userInEvent?.userId,
			eventId: userInEvent?.eventId,
		};
	} catch (error) {
		console.error("Error checking if user is in the event:", error);
		throw error;
	}
};

export const sendRequest = async ({
	senderWallet,
	targetWallet,
	eventSlug,
}: {
	senderWallet: string;
	targetWallet: string;
	eventSlug: string;
}) => {
	try {
		// Step 1: Find the event by slug
		const event = await prisma.event.findUnique({
			where: { slug: eventSlug },
			select: { id: true },
		});

		if (!event) throw Error(`Event with slug ${eventSlug} not found`);

		// Step 2: Ensure both sender and target are in the event
		const senderInEvent = await prisma.eventUser.findFirst({
			where: {
				User: { walletAddress: senderWallet },
				eventId: event.id,
			},
			select: { userId: true },
		});

		const targetInEvent = await prisma.eventUser.findFirst({
			where: {
				User: { walletAddress: targetWallet },
				eventId: event.id,
			},
			select: { userId: true },
		});

		if (!senderInEvent || !targetInEvent) {
			throw Error(
				"Both sender and target must be part of the event to send a request"
			);
		}

		// Step 3: Ensure no duplicate requests between these users in the same event
		const existingRequest = await prisma.request.findFirst({
			where: {
				userId: senderInEvent.userId,
				targetUserId: targetInEvent.userId,
				eventId: event.id,
				status: { in: ["PENDING", "ACCEPTED"] }, // Ignore already rejected requests
			},
		});

		if (existingRequest) {
			throw Error("A request already exists between you and the user");
		}

		// Step 4: Create the request
		const request = await prisma.request.create({
			data: {
				userId: senderInEvent.userId,
				targetUserId: targetInEvent.userId,
				eventId: event.id,
				status: "PENDING",
			},
		});

		return request;
	} catch (error: any) {
		console.error("Error sending request:", error.message);
		throw error;
	}
};

export const acceptRequest = async (requestId: number, eventSlug: string) => {
	try {
		const event = await prisma.event.findUnique({
			where: { slug: eventSlug },
			select: { id: true },
		});

		if (!event) {
			throw Error(`Event with slug ${eventSlug} not found`);
		}

		const existingRequest = await prisma.request.findFirst({
			where: {
				id: requestId,
				eventId: event.id, // Ensure the request belongs to this event
			},
		});

		if (!existingRequest) {
			throw Error(
				`Request with id ${requestId} for event ${eventSlug} not found`
			);
		}

		// Accept the request by updating its status
		const acceptedRequest = await prisma.request.update({
			where: { id: requestId },
			data: { status: "ACCEPTED" },
		});

		return acceptedRequest;
	} catch (error: any) {
		console.error("Error accepting request:", error.message);
		throw Error(`Failed to accept request: ${error.message}`);
	}
};

export const rejectRequest = async (requestId: number, eventSlug: string) => {
	try {
		const event = await prisma.event.findUnique({
			where: { slug: eventSlug },
			select: { id: true },
		});

		if (!event) {
			throw Error(`Event with slug ${eventSlug} not found`);
		}

		const existingRequest = await prisma.request.findFirst({
			where: {
				id: requestId,
				eventId: event.id, // Ensure the request belongs to this event
			},
		});

		if (!existingRequest) {
			throw Error(
				`Request with id ${requestId} for event ${eventSlug} not found`
			);
		}

		// Reject the request by updating its status
		const rejectedRequest = await prisma.request.update({
			where: { id: requestId },
			data: { status: "REJECTED" },
		});

		return rejectedRequest;
	} catch (error: any) {
		console.error("Error rejecting request:", error.message);
		throw Error(`Failed to reject request: ${error.message}`);
	}
};

export const getAllRequestsForUser = async (
	walletAddress: string,
	eventSlug: string
) => {
	console.log(
		"Fetching requests for user:",
		walletAddress,
		"in event:",
		eventSlug
	);

	try {
		const user = await prisma.user.findUnique({
			where: { walletAddress },
			select: { id: true },
		});

		if (!user) {
			throw Error("User not found");
		}

		// Retrieve all requests related to the user in this event by eventSlug
		const requests = await prisma.request.findMany({
			where: {
				AND: [
					{
						OR: [{ userId: user.id }, { targetUserId: user.id }],
					},
					{
						event: {
							slug: eventSlug,
						},
					},
				],
			},
			include: {
				user: {
					select: {
						walletAddress: true,
						name: true,
						email: true,
						x: true,
						instagram: true,
						createdAt: true,
					},
				},
				targetUser: {
					select: {
						walletAddress: true,
						name: true,
						email: true,
						x: true,
						instagram: true,
						createdAt: true,
					},
				},
				event: {
					select: { name: true, slug: true },
				},
			},
		});

		return { requests, userId: user.id };
	} catch (error: any) {
		console.error("Error fetching requests:", error.message);
		throw error;
	}
};

export const getAllRequestsForEvent = async (
	eventSlug: string,
	currentUserWallet: string
) => {
	console.log(
		"Fetching requests and users for event:",
		eventSlug,
		currentUserWallet
	);

	try {
		// Step 1: Find the event by slug
		const event = await prisma.event.findUnique({
			where: { slug: eventSlug },
			select: { id: true, name: true, slug: true },
		});

		if (!event) {
			throw new Error("Event not found");
		}

		// Step 2: Fetch the current user and all event users in one query
		const eventUsers = await prisma.eventUser.findMany({
			where: {
				eventId: event.id,
			},
			include: {
				User: {
					select: {
						id: true,
						name: true,
						email: true,
						walletAddress: true,
					},
				},
			},
		});

		// Get the current user from the eventUsers result
		const currentUser = eventUsers.find(
			(eventUser) => eventUser.User.walletAddress === currentUserWallet
		);

		if (!currentUser) {
			throw new Error("Current user not found in event");
		}

		// Step 3: Fetch only accepted requests for the event
		const requests = await prisma.request.findMany({
			where: {
				eventId: event.id,
				status: "ACCEPTED", // Only include accepted requests
			},
			include: {
				user: {
					select: { walletAddress: true, name: true, email: true },
				},
				targetUser: {
					select: { walletAddress: true, name: true, email: true },
				},
			},
		});

		// Step 4: Group and calculate connections for each user in the event
		const connections = await prisma.request.groupBy({
			by: ["userId", "targetUserId"],
			where: {
				eventId: event.id,
				status: "ACCEPTED", // Only count accepted requests
			},
			_count: true,
		});

		// Map connections to each user
		const usersWithConnections = eventUsers.map((eventUser) => {
			const userConnections = connections.reduce((acc, request) => {
				if (
					request.userId === eventUser.userId ||
					request.targetUserId === eventUser.userId
				) {
					return acc + request._count;
				}
				return acc;
			}, 0);

			return {
				id: eventUser.User.id,
				name: eventUser.User.name,
				email: eventUser.User.email,
				walletAddress: eventUser.User.walletAddress,
				connections: userConnections,
			};
		});

		// Step 6: Get the current user's details with connection count
		const currentUserWithConnections = usersWithConnections.find(
			(user) => user.walletAddress === currentUserWallet
		);

		return {
			event,
			currentUser: currentUserWithConnections, // Current user with connection count
			users: usersWithConnections, // All event users with connection counts
			requests, // Only accepted requests in the event
		};
	} catch (error: any) {
		console.error("Error fetching requests and users:", error.message);
		throw error;
	}
};
