import { Command } from "./command.js";

function extractCommandInformation(prompt: string) {
	const tokens = prompt.slice(1).trim().split(/\s+/);
	const [commandName, ...args] = tokens;

	return {
		commandName,
		args,
	};
}

export class CommandRegistry {
	private commands = new Map<string, Command>();

	public register(cmd: Command) {
		this.commands.set(cmd.name, cmd);
	}

	public isCommand(prompt: string) {
		return prompt.startsWith("/");
	}

	public getCompletions(prompt: string): string[] {
		const { commandName } = extractCommandInformation(prompt);
		return [...this.commands.keys()].filter((name) => name.startsWith(commandName)).map((name) => `/${name}`);
	}
}
