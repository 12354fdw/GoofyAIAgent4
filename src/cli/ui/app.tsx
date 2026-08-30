import { useState } from "react";
import { CheckpointTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { Box } from "ink";
import { Prompt } from "./prompt.js";
import { History } from "./history.js";
import { ComlinkClient } from "../../common/client/networking/comlinkClient.js";
import { JSONAttemptStringify } from "../../shared/jsonAttemptStringify.js";

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

	const setToolCheckpoint = (id: string, updates: Partial<Extract<CheckpointTypes, { type: "tool" }>>) => {
		setHistory((previous) =>
			previous.map((checkpoint) =>
				checkpoint.type === "tool" && checkpoint.toolId === id ? { ...checkpoint, ...updates } : checkpoint,
			),
		);
	};

	const generateOutput = async (prompt: string) => {
		const stream = client.stream("default-session", prompt);

		for await (const part of stream) {
			switch (part.type) {
				case "token":
					setAssistantCheckpoint(part.content);
					break;

				case "tool_start":
					appendCheckpoint({
						type: "tool",
						status: "pending",
						toolName: part.name,
						toolId: part.id,
						result: "",
						arguments: part.arguments,
					});
					break;

				case "tool_end":
					setToolCheckpoint(part.id, {
						status: "done",
						result: JSONAttemptStringify(part.result),
					});
					break;
			}
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
