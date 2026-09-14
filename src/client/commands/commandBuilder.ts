import z from "zod";
import { CommandContext } from "./commandContext.js";
import { Command } from "./command.js";

export type InferSchemaShape<T extends Record<string, z.ZodTypeAny>> = {
	[K in keyof T]: z.infer<T[K]>;
};

export class CommandBuilder<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	private _name: string | undefined;
	private parameters: Record<string, z.ZodTypeAny> = {};
	private executor?: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void;

	constructor() {}

	public name(name: string) {
		this._name = name;
		return this;
	}

	public parameter<K extends string, T extends z.ZodTypeAny>(
		name: K,
		type: T,
	): CommandBuilder<TParams & { [P in K]: T }> {
		this.parameters[name] = type;
		return this as unknown as CommandBuilder<TParams & { [P in K]: T }>;
	}

	public execute<K extends string, T extends z.ZodTypeAny>(
		cb: (ctx: CommandContext, args: InferSchemaShape<TParams>) => Promise<void> | void,
	): CommandBuilder<TParams & { [P in K]: T }> {
		this.executor = cb;
		return this as unknown as CommandBuilder<TParams & { [P in K]: T }>;
	}

	public construct() {
		if (!this._name)
			throw new Error(`Unable to construct command since it has no name! (read trace to see registeration`);

		if (!this.executor) throw new Error(`Unable to construct command "${this._name}" because it has no executor!`);
		return new Command<TParams>(this._name, this.parameters, this.executor) as Command;
	}
}
