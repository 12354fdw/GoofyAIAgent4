// import { readFileSync } from "node:fs";
// async function runAgent(prompt: string) {
// 	process.stdout.write("\n----------------------------\n");
// }

import { ComliinkClientNetworking } from "./networking/comlinkClientNetworking.js";

export async function ENTRY_CLIENT() {
	new ComliinkClientNetworking(4613);
}
