import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { ensureRedisConnected, redisClient } from "./lib/redis";

const PORT = config.port;

const main = () => {
	// Listen IMMEDIATELY so the platform's health check passes as soon as the
	// process boots. Blocking listen on DB/Redis/SMTP handshakes made cold
	// starts take tens of seconds (and hang forever when Redis or SMTP was
	// unreachable). Each dependency is now connected lazily in the background;
	// Prisma and node-redis both open connections on first use anyway.
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});

	void prisma
		.$connect()
		.then(() => {
			console.log("Connected to the database successfully.");
		})
		.catch((error: unknown) => {
			console.error("Database connection failed:", error);
		});

	void ensureRedisConnected().catch((error: unknown) => {
		console.error("Redis connection failed:", error);
	});

	// SMTP is verified lazily on first send — a boot-time `transporter.verify()`
	// Gmail handshake could block startup for tens of seconds or fail on hosts
	// that throttle outbound SMTP (Render blocks it in some plans/regions).

	// Graceful shutdown: let Render finish in-flight requests on deploy/sleep.
	const shutdown = (signal: string) => {
		console.log(`${signal} received, shutting down...`);
		void prisma
			.$disconnect()
			.catch(() => {})
			.finally(() => {
				if (redisClient.isOpen) {
					redisClient.destroy();
				}
				process.exit(0);
			});
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));
};

main();
