import { registerCommands } from "./commandRegistrations.js";
import { CommandRegistry } from "./commandRegistry.js";

export class CommandSystem {
	public readonly cmdRegistry = new CommandRegistry();

	constructor() {
		registerCommands(this.cmdRegistry);
	}
}
