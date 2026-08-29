import { useState } from "react";
import { CheckpointTypes } from "../../shared/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { ComlinkClient } from "../../common/client/networking/comlinkClient.js";

type AppProps = {
	client: ComlinkClient;
};

export const App = ({ client }: AppProps) => {
	const [history, setHistory] = useState<CheckpointTypes[]>([]);

	const appendCheckpoint = (checkpoint: CheckpointTypes) => {
		setHistory((previous) => [...previous, checkpoint]);
	};

	const setAssistantCheckpoint = (content: string) => {
		setHistory((previous) => {
			const last = previous[previous.length - 1];
			if (last?.type === "assistant") {
				return [...previous.slice(0, -1), { type: "assistant", content: last.content + content }];
			}
			return [...previous, { type: "assistant", content }];
		});
	};

	const generateOutput = async (prompt: string) => {
		const stream = client.stream("default-session", prompt);

		for await (const part of stream) {
			if (part.type !== "token") continue;

			setAssistantCheckpoint(part.content);
		}
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

					generateOutput(prompt);
				}}
			/>
		</Box>
	);
};
