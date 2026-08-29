import { render } from "ink";
import { App } from "./ui/app.js";
import { ComlinkClient } from "../common/client/networking/comlinkClient.js";

export async function ENTRY_CLIENT() {
	const client = new ComlinkClient();
	await client.awaitReady();

	render(<App client={client} />);
}
