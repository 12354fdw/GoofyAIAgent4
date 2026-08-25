import { WebSocket } from "ws";
import { Remote, wrap } from "comlink";
import { ComlinkServerAPI } from "../../server/networking/comlinkServerAPI.js";
import { createEndpoint } from "../../shared/createEndpoint.js";

export class ComliinkClientNetworking {
	private readonly socket;
	private readonly remote: Remote<ComlinkServerAPI>;

	constructor(private port: number) {
		this.socket = new WebSocket(`ws://localhost:${port}`);

		this.socket.once("open", () => {
			this.socket.send(`{"mode":"comlink_mode"}`);
		});

		this.remote = wrap<ComlinkServerAPI>(createEndpoint(this.socket));
	}
}
