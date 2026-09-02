import { useState } from "react";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { ComlinkClient } from "../../common/client/networking/comlinkClient.js";

type AppProps = {
	client: ComlinkClient;
};

export const App = ({ client }: AppProps) => {
	const [history, setHistory] = useState<CheckpointEntryTypes[]>([]);

	client.checkpointStore.onChange = (history: CheckpointEntryTypes[]) => {
		setHistory(history);
	};

	return (
		<Box flexDirection="column">
			<History history={history}></History>

			<Prompt
				onSubmit={(prompt: string) => {
					client.sendUserPrompt("default-session", prompt);
				}}
			/>
		</Box>
	);
};
