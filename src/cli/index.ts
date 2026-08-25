import { readFileSync } from "node:fs";
import { WebSocket } from "ws";
import { wrap } from "comlink";
import { createEndpoint } from "../shared/createEndpoint.js";
import type { ComlinkServerAPI } from "../server/networking/comlinkServerAPI.js";

const socket = new WebSocket("ws://localhost:4613");

const remote = wrap<ComlinkServerAPI>(createEndpoint(socket));

async function runAgent(prompt: string) {
	const stream = await remote.stream("default-session", prompt);
	for await (const part of stream) {
		if (part.type === "token") process.stdout.write(part.content);
	}
	process.stdout.write("\n----------------------------\n");
}

export async function ENTRY_CLIENT() {
	await runAgent(readFileSync("prompt.txt", "utf-8"));
	socket.close();
}
