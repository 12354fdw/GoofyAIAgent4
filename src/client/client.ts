import { ComlinkClient } from "./networking/comlinkClient.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { ClientSession } from "./clientSession.js";
import { CommandRegistry } from "./commands/commandRegistry.js";
import { registerCommands } from "./commands/commandRegistrations.js";

export class Client {
	public currentSession: ClientSession | null = null;
	public commandRegistry = new CommandRegistry();

	private rpc: ComlinkClient;

	private constructor(private networking: ComlinkClientNetworking) {
		this.rpc = new ComlinkClient(networking);
		registerCommands(this.commandRegistry);
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
