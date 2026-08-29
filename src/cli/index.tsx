import { render } from "ink";
import { Prompt } from "./ui/prompt.js";
import { LOGGER } from "../server/logger.js";

export async function ENTRY_CLIENT() {
	render(
		<Prompt
			onSubmit={(prompt: string) => {
				LOGGER.info(prompt);
			}}
		/>,
	);
}
