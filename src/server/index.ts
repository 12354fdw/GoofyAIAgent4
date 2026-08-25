import { WebSocketServer } from "ws";
import { LOGGER } from "./logger.js";
import { handleConnection } from "./networking/handleConnection.js";

const PORT = 4613;

export function ENTRY_server() {
	process.on("uncaughtException", (error: Error) => {
		LOGGER.fatal("Uncaught Exception!", error);
		process.exit(1);
	});

	process.on("unhandledRejection", (error: Error) => {
		LOGGER.fatal("Unhandled Rejection!", error);
		process.exit(1);
	});

	const wss = new WebSocketServer({ port: PORT });

	wss.on("connection", handleConnection);

	LOGGER.info(`Server running on port ${PORT}`);
}
