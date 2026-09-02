import { WebSocket } from "ws";
import { Remote, wrap } from "comlink";
import { ComlinkServerAPI } from "../../../server/networking/comlinkServerAPI.js";
import { createEndpoint } from "../../../shared/createEndpoint.js";
import { ReadyOrNot } from "../../../shared/readyOrNot.js";

export class ComliinkClientNetworking {
	private readyOrNot = new ReadyOrNot();

	private readonly socket;
	public readonly remote: Remote<ComlinkServerAPI>;

	constructor(private port: number) {
		this.socket = new WebSocket(`ws://localhost:${port}`);

		this.socket.once("open", () => {
			this.socket.send(`{"mode":"comlink_mode"}`);
			this.readyOrNot.ready();
		});

		this.remote = wrap<ComlinkServerAPI>(createEndpoint(this.socket));
	}

	public async awaitReady() {
		return this.readyOrNot.awaitReady();
	}

	public async createCheckpointSocket(): Promise<WebSocket> {
		const socket = new WebSocket(`ws://localhost:${this.port}`);

		await new Promise<void>((resolve, reject) => {
			socket.once("open", () => {
				socket.send(JSON.stringify({ mode: "session_stream_mode" }));
				resolve();
			});
			socket.once("error", reject);
		});

		return socket;
	}
}
