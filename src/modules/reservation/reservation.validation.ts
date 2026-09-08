import z from "zod";

const CreateReservationZodSchema = z.object({
	listingId: z
		.string("Listing id is required")
		.min(1, "Listing id is required"),
	quantity: z
		.number("Quantity must be a number")
		.int("Quantity must be a whole number")
		.positive("Quantity must be greater than zero"),
});

export const ReservationValidation = {
	CreateReservationZodSchema,
};
