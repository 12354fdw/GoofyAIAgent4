import { WebSocket } from "ws";
import { Remote, wrap } from "comlink";
import { ComlinkServerAPI } from "../../server/networking/comlinkServerAPI.js";
import { createEndpoint } from "../../shared/createEndpoint.js";

export class ComliinkClientNetworking {
	private readonly socket;
	public readonly remote: Remote<ComlinkServerAPI>;

	constructor(private port: number) {
		this.socket = new WebSocket(`ws://localhost:${port}`);

		this.socket.once("open", () => {
			this.socket.send(`{"mode":"comlink_mode"}`);
		});

		this.remote = wrap<ComlinkServerAPI>(createEndpoint(this.socket));
	}

	public async createStreamingSocket(id: string): Promise<WebSocket> {
		const socket = new WebSocket(`ws://localhost:${this.port}`);

		await new Promise<void>((resolve, reject) => {
			socket.once("open", () => {
				socket.send(
					JSON.stringify({
						mode: "stream_mode",
						id,
					}),
				);
				resolve();
			});
			socket.once("error", reject);
		});

		return socket;
	}
}
