import z from "zod";
import { CommandRegistry } from "./commandRegistry.js";
import { CommandBuilder } from "./commandBuilder.js";
import { CommandContext } from "./commandContext.js";

export function registerCommands(registry: CommandRegistry) {
	registry.register(
		new CommandBuilder()
			.name("test")
			.execute((ctx: CommandContext) => {
				ctx.sendMessage("hello from command!");
			})
			.construct(),
	);

	registry.register(
		new CommandBuilder()
			.name("echo")
			.parameter("text", z.string())
			.execute((ctx, args) => {
				ctx.sendMessage(args.text);
			})
			.construct(),
	);
}
