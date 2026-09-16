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

export type ParsedCommandArguments<TParams extends Record<string, z.ZodTypeAny>> =
	{ success: true; args: InferArgs<TParams> } | { success: false };

export class Command<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	private readonly schema: z.ZodTypeAny;

	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly parameters: Parameter[],
		private readonly handler: CommandHandler<TParams>,
	) {
		const shape: Record<string, z.ZodTypeAny> = {};
		for (const { name, type } of parameters) {
			shape[name] = strictCoerce(type);
		}
		this.schema = z.object(shape);
	}

	public execute(ctx: CommandContext, args: InferArgs<TParams>) {
		return this.handler(ctx, args);
	}

	public validateArguments(tokens: string[]): boolean {
		return this.parseArguments(tokens).success;
	}

	public parseArguments(tokens: string[]): ParsedCommandArguments<TParams> {
		const mapped: Record<string, unknown> = {};
		this.parameters.forEach((param, index) => {
			mapped[param.name] = tokens[index];
		});

		const result = this.schema.safeParse(mapped);
		if (!result.success) return { success: false };

		return { success: true, args: result.data as InferArgs<TParams> };
	}
}
