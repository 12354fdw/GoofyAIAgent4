import z from "zod";
import { CommandContext } from "./commandContext.js";
import { InferSchemaShape } from "./commandBuilder.js";

export class Command<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	constructor(
		public readonly name: string,
		public readonly parameters: Record<string, z.ZodTypeAny>,
		private readonly executor: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void,
	) {}

	public run(ctx: CommandContext, args: InferSchemaShape<TParams>) {
		this.executor(ctx, args);
	}
}
