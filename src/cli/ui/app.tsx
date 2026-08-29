import { useState } from "react";
import { CheckpointTypes } from "../../shared/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";

export const App = () => {
	const [history, setHistory] = useState<CheckpointTypes[]>([]);

	const appendCheckpoint = (checkpoint: CheckpointTypes) => {
		setHistory((previous) => [...previous, checkpoint]);
	};

	return (
		<Box flexDirection="column">
			<History history={history}></History>

			<Prompt
				onSubmit={(prompt: string) => {
					appendCheckpoint({
						type: "user",
						content: prompt,
					});
				}}
			/>
		</Box>
	);
};
