import { render } from "ink";
import { App } from "./ui/app.js";
import { ComlinkClient } from "../common/client/networking/comlinkClient.js";
import { NetworkedCheckpointDeltas } from "../shared/checkpoints/networkedCheckpoints.js";

export async function ENTRY_CLIENT() {
	const client = new ComlinkClient();
	await client.awaitReady();

	const ws = await client.networking.createCheckpointSocket();

	ws.on("message", (raw) => {
		const delta = JSON.parse(raw.toString()) as NetworkedCheckpointDeltas;
		client.checkpointStore.handleDelta(delta);
	});

	render(<App client={client} />);
}
