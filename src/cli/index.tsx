import { render } from "ink";
import { Prompt } from "./ui/prompt.js";

export async function ENTRY_CLIENT() {
	render(<Prompt />);
}
