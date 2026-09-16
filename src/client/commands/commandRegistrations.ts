import z from "zod";
import { CommandRegistry } from "./commandRegistry.js";
import { CommandBuilder } from "./commandBuilder.js";
import { CommandContext } from "./commandContext.js";

export function registerCommands(registry: CommandRegistry) {
	registry.register(
		new CommandBuilder()
			.name("test")
			.describe("just sends a message")
			.handler((ctx: CommandContext) => {
				ctx.sendMessage("hello from command!");
			})
			.build(),
	);

	registry.register(
		new CommandBuilder()
			.name("echo")
			.describe("repeats the string you provided x times")
			.parameter("text", z.string())
			.parameter("times", z.number().positive())
			.handler((ctx, args) => {
				for (let i = 0; i < args.times; i++) {
					ctx.sendMessage(args.text);
				}
			})
			.build(),
	);

	registry.register(
		new CommandBuilder()
			.name("throw")
			.describe("just throws and error")
			.handler(() => {
				throw new Error("error thrown!");
			})
			.build(),
	);
}
