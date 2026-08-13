import { ToolRegistry } from "../toolRegistry.js";
import { InstructionPaths } from "../util.js";
import { Session } from "./session.js";

export class SessionController {
	private static instance: SessionController;
	private sessions = new Map<string, Session>();

	private constructor(private toolRegistry: ToolRegistry) {
		this.createSession("default-session");
	}

	public static getInstance() {
		if (!SessionController.instance) SessionController.instance = new SessionController(ToolRegistry.getInstance());
		return SessionController.instance;
	}

	public createSession(key: string, instruction: InstructionPaths = "SYSTEM/AGENT.md") {
		if (this.sessions.get(key)) throw new Error(`Session '${key}' already exists!`);

		const session = new Session("inclusionai/ling-3.0-flash", this.toolRegistry, instruction);
		this.sessions.set(key, session);
		return session;
	}

	public getSession(key: string) {
		const session = this.sessions.get(key);
		if (!session) throw new Error(`Unable to find session '${key}'`);
		return session;
	}

	public async runTemporaryAgent(prompt: string, instruction: InstructionPaths) {
		const session = new Session("inclusionai/ling-3.0-flash", this.toolRegistry, instruction);
		const stream = await session.stream(prompt);

		return stream.text;
	}
}
