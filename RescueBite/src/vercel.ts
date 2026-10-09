
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app";
import { prisma } from "./lib/prisma";
import { redisClient } from "./lib/redis";

let initialization: Promise<void> | undefined;

function initializeServices(): Promise<void> {
  if (!initialization) {
    initialization = (async () => {
      await prisma.$connect();

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    })();
  }

  return initialization;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    await initializeServices();
    return app(req, res);
  } catch (error) {
    console.error("Vercel function initialization failed:", error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ message: "Internal server error" }));
    }
  }
}