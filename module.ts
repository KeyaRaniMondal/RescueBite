import { module } from "@prisma/composer";
import { postgres } from "@prisma/composer-prisma-cloud/orm";


import { appContract } from "./prisma/composer.ts";
import app from "./src/app.ts";

export default module("rescuebite", ({ provision }) => {
  const database = provision(
    postgres({
      name: "database",
      contract: appContract,
      config: "./prisma.config.ts",
    }),
    { id: "database" },
  );

  provision(app, { deps: { database } });
});
