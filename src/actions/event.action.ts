"use server";

import prisma from "@/lib/db";

export const createEvent = async ({ users, eventName }: any) => {
	try {
		// Step 1: Create the event
		const newEvent = await prisma.event.create({
			data: {
				name: eventName,
			},
		});

		localStorage.setItem(`eventName`, eventName);
		localStorage.setItem(`eventId-${eventName}`, newEvent?.id.toString());

		// Step 2: Iterate through users parsed from the CSV
		{
			users.map(async (userData: any) => {
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

				// Step 4: Link the user to the event via EventUser
				await prisma.eventUser.create({
					data: {
						userId: user.id,
						eventId: newEvent.id,
					},
				});
			});
		}

		console.log("Event and users successfully created and linked!");
	} catch (error) {
		console.error("Error creating event or adding users:", error);
	}
};
