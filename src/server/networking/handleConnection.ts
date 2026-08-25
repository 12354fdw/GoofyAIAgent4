import { WebSocket } from "ws";
import { LOGGER } from "../slogger.js";
import { expose } from "comlink";
import { ComlinkServerAPI } from "./comlinkServerAPI.js";
import { createEndpoint } from "../../shared/createEndpoint.js";

export function handleConnection(ws: WebSocket) {
	ws.once("message", (raw) => {
		const data = JSON.parse(raw.toString());

		switch (data.mode) {
			case "comlink_mode": {
				LOGGER.info("Client connected! Comlink mode");
				const endpoint = createEndpoint(ws);
				expose(ComlinkServerAPI.getInstance(), endpoint);
			}
		}
	});
}
