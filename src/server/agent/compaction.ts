import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, ModelMessage, pruneMessages } from "ai";
import { readPrompt } from "../util.js";

export const COMPACTION_TOKEN_COUNT = 10_000;
const PROTECT_TAIL_N = 5;

export class Compactor {
	constructor(private compactionModel: string = "deepseek/deepseek-v4-flash-0731") {}

	public async compact(messages: ModelMessage[]) {
		const head = messages.slice(0, 2);

		let tailStartIdx = messages.length - PROTECT_TAIL_N;
		while (tailStartIdx > 2 && messages[tailStartIdx]?.role === "tool") {
			tailStartIdx--;
		}

		const tail = messages.slice(tailStartIdx);

		const rawMiddle = messages.slice(2, tailStartIdx);

		const middle = pruneMessages({
			messages: rawMiddle,
			toolCalls: "all",
			reasoning: "all",
			emptyMessages: "remove",
		});

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
