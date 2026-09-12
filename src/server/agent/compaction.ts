import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, ModelMessage, pruneMessages } from "ai";
import { readPrompt } from "../util.js";

export const COMPACTION_TOKEN_COUNT = 750_000;
const PROTECT_TAIL_N = 10;

function hasToolCalls(message?: ModelMessage): boolean {
	if (!message || message.role !== "assistant") return false;
	if (Array.isArray(message.content)) {
		return message.content.some((part) => part.type === "tool-call");
	}
	return false;
}

export class Compactor {
	constructor(private compactionModel: string = "deepseek/deepseek-v4-flash-0731") {}

	public async compact(messages: ModelMessage[]) {
		if (messages.length <= PROTECT_TAIL_N + 4) {
			return messages;
		}

		let headEndIdx = 2;
		while (
			headEndIdx < messages.length &&
			(messages[headEndIdx]?.role === "tool" || hasToolCalls(messages[headEndIdx - 1]))
		) {
			headEndIdx++;
		}

		let tailStartIdx = Math.max(headEndIdx, messages.length - PROTECT_TAIL_N);

		while (tailStartIdx > headEndIdx) {
			const msg = messages[tailStartIdx];

			if (msg?.role === "tool" || hasToolCalls(messages[tailStartIdx - 1])) {
				tailStartIdx--;
				continue;
			}

			break;
		}

		if (tailStartIdx <= headEndIdx) {
			return messages;
		}

		const head = messages.slice(0, headEndIdx);
		const tail = messages.slice(tailStartIdx);
		const rawMiddle = messages.slice(headEndIdx, tailStartIdx);

		if (rawMiddle.length === 0) {
			return messages;
		}

		const middle = pruneMessages({
			messages: rawMiddle,
			toolCalls: "all",
			reasoning: "all",
			emptyMessages: "remove",
		});

		if (middle.length === 0) {
			return [...head, ...tail];
		}

		const summaryText = await generateText({
			model: openrouter(this.compactionModel),
			instructions: readPrompt("SYSTEM/COMPACTION.md"),
			prompt: JSON.stringify(middle),
		});

		const summaryMessage: ModelMessage = {
			role: "user",
			content: `[ COMPACTION ], SUMMARY:\n${summaryText.text}`,
		};

		return [...head, summaryMessage, ...tail];
	}
}
