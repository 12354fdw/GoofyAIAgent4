import z from "zod";
import { CommandContext } from "./commandContext.js";
import { InferArgs } from "./commandBuilder.js";

export function strictCoerce<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
	const type = schema.type;

	if (type === "number") {
		return z.preprocess((value) => {
			if (typeof value !== "string") return value;
			const trimmed = value.trim();
			if (trimmed === "" || !Number.isFinite(Number(trimmed))) return value;
			return Number(trimmed);
		}, schema);
	}

	if (type === "boolean") {
		return z.preprocess((value) => {
			if (typeof value !== "string") return value;
			const trimmed = value.trim().toLowerCase();
			if (trimmed === "true") return true;
			if (trimmed === "false") return false;
			return value;
		}, schema);
	}

	return schema;
}

export type Parameter = { name: string; type: z.ZodTypeAny };

export type CommandHandler<TParams extends Record<string, z.ZodTypeAny>> = (
	ctx: CommandContext,
	args: InferArgs<TParams>,
) => Promise<void> | void;

export class Command<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly parameters: Parameter[],
		private readonly handler: CommandHandler<TParams>,
	) {}

	public execute(ctx: CommandContext, args: InferArgs<TParams>) {
		this.handler(ctx, args);
	}

	public getArgumentsSchema() {
		const shape: Record<string, z.ZodTypeAny> = {};
		for (const { name, type } of this.parameters) {
			shape[name] = strictCoerce(type);
		}

		return z.object(shape);
	}
}
