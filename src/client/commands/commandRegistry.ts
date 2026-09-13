import { Command } from "./command.js";

export class CommandRegistry {
	private commands = new Map<string, Command>();

	public register(name: string) {
		const cmd = new Command(name);
		return cmd;
	}
}
