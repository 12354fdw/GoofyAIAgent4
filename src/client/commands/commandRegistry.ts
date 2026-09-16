import { Command } from "./command.js";
import { CommandContext } from "./commandContext.js";

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
		const { name, args } = this.parse(prompt);
		const command = this.commands.get(name);

		return command ? command.validateArguments(args) : false;
	}

	public execute(prompt: string, ctx: CommandContext): boolean {
		const { name, args } = this.parse(prompt);
		const command = this.commands.get(name);
		if (!command) return false;

		const parsed = command.parseArguments(args);
		if (!parsed.success) return false;

		command.execute(ctx, parsed.args);
		return true;
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
}
