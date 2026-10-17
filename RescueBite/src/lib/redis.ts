import config from "../config";
import { createClient } from "redis";

export const redisClient = createClient({
	username: config.redis_username,
	password: config.redis_password,
	socket: {
		host: config.redis_host,
		port: Number(config.redis_port),
		// Fail fast instead of hanging boot/requests for minutes when Redis is
		// slow or unreachable (common on free-tier cold starts).
		connectTimeout: 5_000,
		// Keep retrying with a capped backoff so a Redis blip never crashes
		// the process (an unhandled "error" event would otherwise kill it).
		reconnectStrategy: (retries: number) => Math.min(retries * 200, 5_000),
	},
});

// Swallow connection errors: without a listener, node-redis emits an
// uncaught "error" event and the whole process exits.
redisClient.on("error", (error: Error) => {
	console.error("Redis error:", error.message);
});

let connecting: Promise<void> | null = null;

/**
 * Ensure the Redis client is open before running commands. Safe to call
 * concurrently — connects at most once at a time, and is a no-op when the
 * connection is already open. Falls back to a cached failure so a broken
 * Redis produces a fast, clear error instead of a multi-second hang.
 */
export const ensureRedisConnected = async (): Promise<void> => {
	if (redisClient.isOpen) return;

	if (!connecting) {
		connecting = redisClient
			.connect()
			.then(() => {
				console.log("Connected to Redis successfully.");
			})
			.catch((error: unknown) => {
				connecting = null; // allow retry on the next request
				throw error;
			});
	}

	await connecting;
};
