import { ofetch } from "ofetch";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/api/v1";

export const api = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: "include",
});

type BackendErrorBody = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: unknown;
};

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: unknown }).data === "object"
  ) {
    const data = (error as { data: BackendErrorBody }).data;
    if (typeof data.message === "string") return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
