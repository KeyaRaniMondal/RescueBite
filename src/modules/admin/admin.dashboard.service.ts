import { prisma } from "../../lib/prisma";
import {
	Role,
	FoodStatus,
	ReservationStatus,
} from "../../generated/prisma/client";
import type { IDashboardStats } from "./admin.dashboard.interface";

const getDashboardStats = async (): Promise<IDashboardStats> => {
	const [
		totalProviders,
		totalReceivers,
		activeListings,
		completedReservations,
	] = await prisma.$transaction([
		prisma.user.count({ where: { role: Role.PROVIDER } }),
		prisma.user.count({ where: { role: Role.RECEIVER } }),
		prisma.foodListing.count({
			where: {
				status: {
					in: [
						FoodStatus.AVAILABLE,
						FoodStatus.PARTIALLY_RESERVED,
						FoodStatus.FULLY_RESERVED,
					],
				},
			},
		}),
		prisma.reservation.count({
			where: { status: ReservationStatus.COMPLETED },
		}),
	]);

	return {
		totalProviders,
		totalReceivers,
		activeListings,
		completedReservations,
	};
};

export const DashboardService = {
	getDashboardStats,
};