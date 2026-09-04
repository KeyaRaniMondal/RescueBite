import { connectDatabase, db } from "./db.ts";

const password = "$2b$08$C/9FvD5O9vQH7yX2Jp3Z6OqV5vA1fFhGxzBcRv3C1kN1QY0Lz4S5q";

const users = [
  { email: "alice@prisma.io", username: "alice", name: "Alice", password },
  { email: "bob@prisma.io", username: "bob", name: "Bob", password },
  { email: "carol@prisma.io", username: "carol", name: "Carol", password },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  for (const user of users) {
    await db.orm.public.User.upsert({
      create: user,
      update: {},
      conflictOn: { email: user.email },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
