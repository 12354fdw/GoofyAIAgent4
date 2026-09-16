import { ComlinkClient } from "./networking/comlinkClient.js";
import { ComlinkClientNetworking } from "./networking/comlinkClientNetworking.js";
import { ClientSession } from "./clientSession.js";
import { CommandSystem } from "./commands/index.js";
import { CheckpointEntryTypes } from "../shared/checkpoints/checkpointTypes.js";

export class Client {
	public currentSession: ClientSession | null = null;
	public cmdSystem = new CommandSystem();

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

	public executeCommand(prompt: string) {
		const session = this.currentSession;
		if (!session) return false;

		const appendCheckpoint = (checkpoint: CheckpointEntryTypes) => {
			this.rpc.appendCheckpoints(session.sessionName, [checkpoint]);
		};

		appendCheckpoint({ type: "user", content: prompt });

		try {
			this.cmdSystem.execute(prompt, {
				sendMessage: (message) => appendCheckpoint({ type: "command_message", content: message }),
			});
		} catch (err: unknown) {
			if (err instanceof Error) {
				appendCheckpoint({ type: "command_error", content: err.message });
			} else {
				appendCheckpoint({ type: "command_error", content: String(err) });
			}
		}

		this.rpc.appendCheckpoints(session.sessionName, [{ type: "finished" }]);
	}
}
