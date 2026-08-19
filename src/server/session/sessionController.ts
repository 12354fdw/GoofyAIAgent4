import { Tool } from "ai";
import { ToolRegistry } from "../toolRegistry.js";
import { InstructionPaths } from "../util.js";
import { Session } from "./session.js";

export interface SessionParameters {
	model: string;
	instruction?: InstructionPaths;
	toolBlacklist?: Tool[];
}

export class SessionController {
	private static instance: SessionController;
	private sessions = new Map<string, Session>();

	private constructor(private toolRegistry: ToolRegistry) {
		this.createSession("default-session", { model: "inclusionai/ling-3.0-flash" });
	}

	public static getInstance() {
		if (!SessionController.instance) SessionController.instance = new SessionController(ToolRegistry.getInstance());
		return SessionController.instance;
	}

	public createSession(key: string, params: SessionParameters) {
		if (this.sessions.get(key)) throw new Error(`Session '${key}' already exists!`);

		const session = new Session(params, this.toolRegistry);
		this.sessions.set(key, session);
		return session;
	}

	public getSession(key: string) {
		const session = this.sessions.get(key);
		if (!session) throw new Error(`Unable to find session '${key}'`);
		return session;
	}

	public async runTemporaryAgent(prompt: string, params: SessionParameters) {
		const session = new Session(params, this.toolRegistry);
		const stream = await session.stream(prompt);

		return stream.text;
	}
}
