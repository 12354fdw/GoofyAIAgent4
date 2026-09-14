import z from "zod";
import { CommandRegistry } from "./commandRegistry.js";
import { CommandBuilder } from "./commandBuilder.js";
import { CommandContext } from "./commandContext.js";

export function registerCommands(registry: CommandRegistry) {
	registry.register(
		new CommandBuilder()
			.name("test")
			.describe("just sends a message")
			.execute((ctx: CommandContext) => {
				ctx.sendMessage("hello from command!");
			})
			.construct(),
	);

	registry.register(
		new CommandBuilder()
			.name("echo")
			.describe("repeats the string you provided x times")
			.parameter("text", z.string())
			.parameter("times", z.number().positive())
			.execute((ctx, args) => {
				ctx.sendMessage(args.text);
			})
			.construct(),
	);
}
