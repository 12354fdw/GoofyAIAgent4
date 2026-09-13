import { CommandRegistry } from "./commandRegistry.js";

export function registerCommands(registry: CommandRegistry) {
	registry.register("test").execute((ctx) => {
		ctx.sendMessage("Hello from command!");
	});
}
