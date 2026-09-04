import { connectDatabase, db } from "./prisma/db.ts";

await connectDatabase();
console.log("db keys:", Object.keys(db));
console.log("orm keys:", Object.keys(db.orm));
try {
  console.log("pending keys:", Object.keys(db.orm.pending ?? {}));
} catch {}
process.exit(0);
