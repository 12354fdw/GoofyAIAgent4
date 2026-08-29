import { render } from "ink";
import { App } from "./ui/app.js";

export async function ENTRY_CLIENT() {
	render(<App />);
}
