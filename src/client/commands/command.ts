import z from "zod";

export class Command {
	constructor(name: string) {

	}

	public parameter(name: string, type: z.ZodAny) {

	}

	// TODO: give ctx an actual type
	public execute(cb: (ctx: unknown, args: object) => Promise<void>) {

	}
}
