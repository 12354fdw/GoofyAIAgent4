import z from "zod";
import { CommandContext } from "./commandContext.js";
import { InferSchemaShape } from "./commandBuilder.js";

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

export class Command<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly parameterList: Array<{ name: string; type: z.ZodTypeAny }>,
		public readonly parameterTypes: Record<string, z.ZodTypeAny>,
		private readonly executor: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void,
	) {}

	public run(ctx: CommandContext, args: InferSchemaShape<TParams>) {
		this.executor(ctx, args);
	}

	public getSchema() {
		const shape: Record<string, z.ZodTypeAny> = {};
		for (const [name, type] of Object.entries(this.parameterTypes)) {
			shape[name] = strictCoerce(type);
		}

		return z.object(shape);
	}
}
