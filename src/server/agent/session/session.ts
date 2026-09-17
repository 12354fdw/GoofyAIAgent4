import { APICallError } from "ai";
import { CheckpointEntryTypes } from "../../../shared/checkpoints/checkpointTypes.js";
import { SessionData } from "../../../shared/types/sessionData.js";
import { StreamPacketEncoder } from "../../networking/StreamPacketEncoder.js";
import { SessionWebsocketRegistry } from "../../networking/checkpointSocketRegistry.js";
import { ToolRegistry } from "../../tool/toolRegistry.js";
import { Agent } from "./agent.js";
import { SessionController, SessionParameters } from "../sessionController.js";

export class Session {
	private agent: Agent;
	private encoder: StreamPacketEncoder;

	private sessionData: SessionData = {
		history: [],
		lastUserPrompt: "",

		isPending: false,
		promptTime: 0,
		finishTime: 0,

		usage: {
			cost: 0,
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
			accTotalTokens: 0,

			waterEvaporatedLiters: 0,
		},
	};

	constructor(
		private sessionName: string,
		params: SessionParameters,
		toolRegistry: ToolRegistry,
		private sessionController: SessionController,
		private registry: SessionWebsocketRegistry,
	) {
		this.agent = new Agent(params, toolRegistry, this.sessionData, sessionController);
		this.encoder = new StreamPacketEncoder(
			this.sessionName,
			this.registry,
			this.sessionData.history,
			this.sessionData.usage,
		);
	}

	public getSessionData() {
		return this.sessionData;
	}

	//

	public streamRaw(prompt: string) {
		return this.agent.stream(prompt);
	}

	public async streamCheckpointDeltas(prompt: string) {
		this.appendCheckpoint({
			type: "user",
			content: prompt,
		});

		try {
			const stream = this.agent.stream(prompt);
			await this.encoder.encodeStreamingPackets(stream);
		} catch (raw: unknown) {
			if (APICallError.isInstance(raw)) {
				this.appendCheckpoint({
					type: "error",
					message: raw.message,
				});
			} else if (raw instanceof Error) {
				this.appendCheckpoint({
					type: "error",
					message: raw.message,
				});
			} else {
				this.appendCheckpoint({
					type: "error",
					message: "Unknown error",
				});
			}

			this.appendCheckpoint({
				type: "finished",
			});
		}
	}

	//

	public appendCheckpoint(checkpoint: CheckpointEntryTypes) {
		if (checkpoint.type === "user") {
			this.sessionData.isPending = true;
			this.sessionData.promptTime = new Date().getTime();
		}

		if (checkpoint.type === "finished") {
			this.sessionData.isPending = false;
			this.sessionData.finishTime = new Date().getTime();
		}

		this.encoder.appendCheckpoint(checkpoint);
	}
}
