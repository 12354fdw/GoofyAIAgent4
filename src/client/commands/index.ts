import { registerCommands } from "./commandRegistrations.js";
import { CommandRegistry } from "./commandRegistry.js";

export class CommandSystem {
	public readonly cmdRegistry = new CommandRegistry();

	constructor() {
		registerCommands(this.cmdRegistry);
	}

	public runCommand(prompt: string) {
		if (!this.cmdRegistry.verifyCommand(prompt)) return;

		const promptInfo = this.cmdRegistry.extractCommandInformation(prompt);
		const cmd = this.cmdRegistry.getCommand(promptInfo.commandName);

		const args = cmd.getSchema().safeParse(this.cmdRegistry.parseParamter(cmd, promptInfo));

		cmd.run(
			{
				sendMessage: () => {
					throw new Error("not implemented!");
				},
			},
			args,
		);
	}
}
