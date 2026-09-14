import { Command } from "./command.js";

export class CommandRegistry {
	private commands = new Map<string, Command>();

	public register(cmd: Command) {
		this.commands.set(cmd.name, cmd);
	}

	public getCompletions(prompt: string): string[] {
		const { commandName } = this.extractCommandInformation(prompt);
		return [...this.commands.keys()].filter((name) => name.startsWith(commandName));
	}

	public getCommand(name: string) {
		const cmd = this.commands.get(name);
		if (!cmd) throw new Error(`Unable to find command "${name}`);

		return cmd;
	}

	//

	public isCommand(prompt: string) {
		return prompt.startsWith("/");
	}

	public isValidCommandName(name: string) {
		return this.commands.has(name);
	}

	public verifyCommand(prompt: string) {
		const info = this.extractCommandInformation(prompt);
		if (!this.isValidCommandName(info.commandName)) return false;

		const command = this.getCommand(info.commandName);

		const args: Record<string, string> = {};
		command.parameterList.forEach((param, index) => {
			args[param.name] = info.args[index];
		});

		const result = command.getSchema().safeParse(args);
		return result.success;
	}

	//

	public extractCommandInformation(prompt: string) {
		const tokens = prompt.slice(1).trim().split(/\s+/);
		const [commandName, ...args] = tokens;

		return {
			commandName,
			args,
		};
	}
}
