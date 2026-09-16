import { registerCommands } from "./commandRegistrations.js";
import { CommandRegistry } from "./commandRegistry.js";

export class CommandSystem {
	public readonly registry = new CommandRegistry();

	constructor() {
		registerCommands(this.registry);
	}

	public execute(prompt: string) {
		if (!this.registry.isValidCommand(prompt)) return;

		const parsed = this.registry.parse(prompt);
		const cmd = this.registry.get(parsed.name);

		const args = cmd.getArgumentsSchema().parse(this.registry.parseArguments(cmd, parsed));

		cmd.execute(
			{
				sendMessage: () => {
					throw new Error("not implemented!");
				},
			},
			args,
		);
	}
}
