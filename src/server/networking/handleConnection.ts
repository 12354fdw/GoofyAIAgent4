import { WebSocket } from "ws";
import { LOGGER } from "../logger.js";
import { expose } from "comlink";
import { ComlinkServerAPI } from "./comlinkServerAPI.js";
import { createEndpoint } from "../../shared/createEndpoint.js";
import { SessionWebsocketRegistry } from "./checkpointSocketRegistry.js";

export function handleConnection(ws: WebSocket) {
	ws.once("message", (raw) => {
		const data = JSON.parse(raw.toString());

		switch (data.mode) {
			case "comlink_mode": {
				LOGGER.info("Client connected! Comlink mode");
				const endpoint = createEndpoint(ws);
				expose(ComlinkServerAPI.getInstance(), endpoint);
				break;
			}

			case "session_stream_mode": {
				LOGGER.info("Client connected! Checkpoint mode");
				SessionWebsocketRegistry.getInstance().registerSocket(ws);
				break;
			}
		}
	});
}
