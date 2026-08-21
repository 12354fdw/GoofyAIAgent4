import { readFileSync } from "node:fs";
import path from "node:path";

export type InstructionPaths = "SYSTEM/AGENT.md" | "SYSTEM/WEBSUMMARY.md" | "SYSTEM/SECURITY.md";

export function readPrompt(promptPath: InstructionPaths) {
	return readFileSync(path.join("prompts", promptPath), "utf-8");
}
