import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { FoodListingController } from "./foodListing.controller";

const router = Router();

router.post(
	"/",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	FoodListingController.createFoodListing,
);

router.get("/", authenticate, FoodListingController.getAllFoodListings);

router.get(
	"/my",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	FoodListingController.getMyFoodListings,
);

router.get("/:id", authenticate, FoodListingController.getFoodListing);

router.patch(
	"/:id/status",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	FoodListingController.updateFoodListingStatus,
);

router.patch(
	"/:id",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	FoodListingController.updateFoodListing,
);

router.delete(
	"/:id",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	FoodListingController.deleteFoodListing,
);

export const FoodListingRoutes = router;
