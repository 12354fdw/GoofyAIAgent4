import { Command } from "./command.js";

export interface ParsedCommand {
	name: string;
	args: string[];
}

export class CommandRegistry {
	private commands = new Map<string, Command>();

	public register(cmd: Command) {
		this.commands.set(cmd.name, cmd);
	}

	public getCompletions(prompt: string): string[] {
		const { name } = this.parse(prompt);
		return [...this.commands.keys()].filter((commandName) => commandName.startsWith(name));
	}

	public get(name: string) {
		const cmd = this.commands.get(name);
		if (!cmd) throw new Error(`Unable to find command "${name}"`);

		return cmd;
	}

	//

	public looksLikeCommand(prompt: string) {
		return prompt.startsWith("/");
	}

	public has(name: string) {
		return this.commands.has(name);
	}

	public isValidCommand(prompt: string) {
		const parsed = this.parse(prompt);
		if (!this.has(parsed.name)) return false;

		const command = this.get(parsed.name);

		const args = this.mapArguments(command, parsed.args);

		const result = command.getArgumentsSchema().safeParse(args);
		return result.success;
	}

	//

	public parse(prompt: string): ParsedCommand {
		const tokens = prompt.slice(1).trim().split(/\s+/);
		const [name, ...args] = tokens;

		return {
			name,
			args,
		};
	}

	public parseArguments(cmd: Command, parsed: ParsedCommand): Record<string, string> {
		return this.mapArguments(cmd, parsed.args);
	}

	private mapArguments(cmd: Command, args: string[]): Record<string, string> {
		const mapped: Record<string, string> = {};
		cmd.parameters.forEach((param, index) => {
			mapped[param.name] = args[index];
		});

		return mapped;
	}
}
