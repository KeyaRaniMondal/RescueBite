// import nextjs from "@prisma/composer/nextjs";
// import { compute } from "@prisma/composer-prisma-cloud";
// import { postgres } from "@prisma/composer-prisma-cloud/orm";

// import { appContract } from "../prisma/composer.ts";

// export default compute({
//   name: "app",
//   deps: {
//     database: postgres(appContract),
//   },
//   build: nextjs({ module: import.meta.url, appDir: "." }),
// });
import app from "./app";
import config from "./config";
import { connectDatabase } from "../prisma/db.ts";

const PORT = Number(config.port) || 5000;

const main = async () => {
	try {
		await connectDatabase();
		console.log("Connected to the database successfully.");

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		process.exit(1);
	}
};

main();
