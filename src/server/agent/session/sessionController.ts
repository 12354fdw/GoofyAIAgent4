import { InstructionInfo } from "../../util.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { Session } from "./session.js";

export interface SessionParameters {
	model: string;
	instruction?: InstructionInfo;
	toolBlacklist?: string[];
}

export class SessionController {
	private static instance: SessionController;
	private sessions = new Map<string, Session>();

	private constructor(private toolRegistry: ToolRegistry) {
		this.createSession("default-session", { model: "deepseek/deepseek-v4-flash-0731" });
	}

	public static getInstance() {
		if (!SessionController.instance) SessionController.instance = new SessionController(ToolRegistry.getInstance());
		return SessionController.instance;
	}

	public createSession(key: string, params: SessionParameters) {
		if (this.sessions.get(key)) throw new Error(`Session '${key}' already exists!`);

		const session = new Session(params, this.toolRegistry, this);
		this.sessions.set(key, session);
		return session;
	}

	public getSession(key: string) {
		const session = this.sessions.get(key);
		if (!session) throw new Error(`Unable to find session '${key}'`);
		return session;
	}

	public async runTemporaryAgent(prompt: string, params: SessionParameters) {
		const session = new Session(params, this.toolRegistry, this);

		let text = "";
		for await (const part of session.streamRaw(prompt)) {
			if (part.type === "token") text += part.content;
		}

		return text;
	}
}
