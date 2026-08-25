import { LOGGER } from "./slogger.js";

export function ENTRY_server() {
	process.on("uncaughtException", (error: Error) => {
		LOGGER.fatal("Uncaught Exception!", error);
		process.exit(1);
	});

	process.on("unhandledRejection", (error: Error) => {
		LOGGER.fatal("Unhandled Rejection!", error);
		process.exit(1);
	});
}
