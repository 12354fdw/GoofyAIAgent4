import { WebSocket, WebSocketServer } from "ws";
import { LOGGER } from "./slogger.js";
import { createEndpoint } from "../shared/createEndpoint.js";
import { expose } from "comlink";
import { ComlinkServerAPI } from "./networking/comlinkServerAPI.js";

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

	wss.on("connection", (ws: WebSocket) => {
		ws.on("message", ())
		const endpoint = createEndpoint(ws);

		expose(new ComlinkServerAPI(), endpoint);
	});

	LOGGER.info(`Server running on port ${PORT}`);
}
