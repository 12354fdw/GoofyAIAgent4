import z from "zod";
import { Command, CommandHandler, Parameter } from "./command.js";

export type InferArgs<T extends Record<string, z.ZodTypeAny>> = {
	[K in keyof T]: z.infer<T[K]>;
};

export class CommandBuilder<TParams extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>> {
	private _name: string | undefined;
	private description: string = "No description";

	private parameters: Parameter[] = [];
	private handlerFn?: CommandHandler<TParams>;

	constructor() {}

	public name(name: string) {
		this._name = name;
		return this;
	}

	public describe(description: string) {
		this.description = description;
		return this;
	}

	public parameter<K extends string, T extends z.ZodTypeAny>(
		name: K,
		type: T,
	): CommandBuilder<TParams & { [P in K]: T }> {
		this.parameters.push({ name, type });

		return this as unknown as CommandBuilder<TParams & { [P in K]: T }>;
	}

	public handler(cb: CommandHandler<TParams>): CommandBuilder<TParams> {
		this.handlerFn = cb;
		return this;
	}

	public build() {
		if (!this._name)
			throw new Error(`Unable to construct command since it has no name! (read trace to see registeration`);

		if (!this.handlerFn) throw new Error(`Unable to construct command "${this._name}" because it has no handler!`);
		return new Command<TParams>(this._name, this.description, this.parameters, this.handlerFn) as Command;
	}
}
