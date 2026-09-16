import { registerCommands } from "./commandRegistrations.js";
import { CommandRegistry } from "./commandRegistry.js";
import { CommandContext } from "./commandContext.js";

export class CommandSystem {
	public readonly registry = new CommandRegistry();

	constructor() {
		registerCommands(this.registry);
	}

	public execute(prompt: string, ctx: CommandContext): boolean {
		return this.registry.execute(prompt, ctx);
	}
}
