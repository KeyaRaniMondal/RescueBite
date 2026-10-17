export interface IAdminProviderListItem {
	id: string;
	userId: string;
	businessName: string;
	businessType: string;
	address: string;
	city: string;
	phone: string;
	isVerified: boolean;
	userName: string;
	userEmail: string;
	createdAt: string;
	updatedAt: string;
}

export type IProviderVerificationFilter = "all" | "pending" | "verified";

export interface IAdminProviderListQuery {
	page: number;
	limit: number;
	searchTerm?: string;
	verification?: IProviderVerificationFilter;
}

export interface IAdminProviderListResult {
	providers: IAdminProviderListItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface IUpdateProviderVerificationPayload {
	isVerified: boolean;
}
