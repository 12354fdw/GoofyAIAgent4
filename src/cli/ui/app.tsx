import { useState } from "react";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { Client } from "../../client/client.js";

type AppProps = {
	client: Client;
};

export const App = ({ client }: AppProps) => {
	const [history, setHistory] = useState<CheckpointEntryTypes[]>([]);

	client.setOnChange((history: CheckpointEntryTypes[]) => {
		setHistory(history);
	});

	return (
		<Box flexDirection="column">
			<History history={history}></History>

			<Prompt
				onSubmit={(prompt: string) => {
					client.sendUserPrompt(prompt);
				}}
			/>
		</Box>
	);
};
