import {
	Prisma,
	FoodStatus,
	ReservationStatus,
} from "../../generated/prisma/client";

export const deallocateListing = async (
	tx: Prisma.TransactionClient,
	listingId: string,
): Promise<void> => {
	const reservationSum = await tx.reservation.aggregate({
		where: {
			listingId,
			status: ReservationStatus.RESERVED,
		},
		_sum: { quantity: true },
	});

	const listing = await tx.foodListing.findUnique({
		where: { id: listingId },
		select: { quantity: true, status: true },
	});

	if (!listing) {
		return;
	}

	const currentlyReserved = reservationSum._sum.quantity ?? 0;

	const nextStatus =
		currentlyReserved >= listing.quantity
			? FoodStatus.FULLY_RESERVED
			: currentlyReserved > 0
				? FoodStatus.PARTIALLY_RESERVED
				: FoodStatus.AVAILABLE;

	if (listing.status !== nextStatus) {
		await tx.foodListing.update({
			where: { id: listingId },
			data: { status: nextStatus },
		});
	}
};
