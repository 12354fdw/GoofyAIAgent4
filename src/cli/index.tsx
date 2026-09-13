import { render } from "ink";
import { App } from "./ui/app.js";
import { Client } from "../client/client.js";
import { ClientContext } from "./ui/clientContext.js";

export async function ENTRY_CLIENT() {
	const client = await Client.create();

	render(
		<ClientContext.Provider value={client}>
			<App />
		</ClientContext.Provider>,
	);
}
