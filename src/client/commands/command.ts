import z from "zod";
import { CommandContext } from "./commandContext.js";

type InferSchemaShape<T extends Record<string, z.ZodTypeAny>> = {
	[K in keyof T]: z.infer<T[K]>;
};

export class Command<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	private parameters: Record<string, z.ZodTypeAny> = {};
	private executor?: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void;

	constructor(public readonly name: string) {}

	public parameter<K extends string, T extends z.ZodTypeAny>(name: K, type: T): Command<TParams & { [P in K]: T }> {
		this.parameters[name] = type;
		return this as unknown as Command<TParams & { [P in K]: T }>;
	}

	public execute(cb: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void) {
		this.executor = cb;
		return this;
	}
}
