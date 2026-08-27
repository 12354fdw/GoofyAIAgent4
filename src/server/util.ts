import { readFileSync } from "node:fs";
import path from "node:path";

export type InstructionPaths = "SYSTEM/AGENT.md" | "SYSTEM/WEBSUMMARY.md" | "SYSTEM/SECURITY.md";

export type InstructionInfo =
	| { type: "builtin"; path: InstructionPaths }
	| { type: "custom"; content: string }
	| InstructionPaths;

export function readPrompt(info: InstructionInfo) {
	if (typeof info === "string") return readFileSync(path.join("prompts", info), "utf-8");
	if (info.type === "builtin") return readFileSync(path.join("prompts", info.path), "utf-8");
	return info.content;
}
