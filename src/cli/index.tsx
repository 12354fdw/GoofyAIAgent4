import { render } from "ink";
import { App } from "./ui/app.js";
import { Client } from "../client/client.js";

export async function ENTRY_CLIENT() {
	const client = await Client.create();

	render(<App client={client} />);
}
