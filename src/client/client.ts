import { ComlinkClient } from "./networking/comlinkClient.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { ClientSession } from "./clientSession.js";

export class Client {
	private rpc: ComlinkClient;

	private constructor(private networking: ComlinkClientNetworking) {
		this.rpc = new ComlinkClient(networking);
	}

	public static async create() {
		const networking = new ComlinkClientNetworking(4613);
		await networking.awaitReady();
		const instance = new Client(networking);
		return instance;
	}

	public connectToSession(sessionName: string): Promise<ClientSession> {
		return ClientSession.create(sessionName, this.rpc, this.networking);
	}
}
