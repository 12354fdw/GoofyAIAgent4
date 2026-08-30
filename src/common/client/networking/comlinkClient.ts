import { SessionParameters } from "../../../server/agent/session/sessionController.js";
import { StreamTypes } from "../../../server/agent/session/streamTypes.js";
import { ComliinkClientNetworking } from "./comlinkClientNetworking.js";

export class ComlinkClient {
	private networking = new ComliinkClientNetworking(4613);

	constructor() {}

	public async awaitReady() {
		return this.networking.awaitReady();
	}

	public async *stream(sessionName: string, prompt: string) {
		const remote = this.networking.remote;

		const id = crypto.randomUUID();
		const socket = await this.networking.createStreamingSocket(id);

		let notifyNewData: () => void = () => {};

		const queue: StreamTypes[] = [];
		let isDone = false;

		socket.on("message", (raw) => {
			const part = JSON.parse(raw.toString()) as StreamTypes;
			if (part.type === "finished") isDone = true;

			queue.push(part);
			notifyNewData();
		});

		remote.processUserRequest(id, sessionName, prompt);

		while (!isDone || queue.length > 0) {
			if (queue.length === 0) {
				await new Promise<void>((res) => {
					notifyNewData = res;
				});
			}

			yield queue.shift()!;
		}

		socket.close();
	}

	public async createSession(sesionName: string, params: SessionParameters) {
		await this.networking.remote.createSession(sesionName, params);
	}
}
