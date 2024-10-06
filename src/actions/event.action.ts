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
		console.log("userInEvent **************************", userInEvent, eventSlug, walletAddress);

		return !!userInEvent;
	} catch (error) {
		console.error("Error checking if user is in the event:", error);
		throw error;
	}
};
