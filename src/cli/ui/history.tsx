import { Box, Text } from "ink";
import { Markdown } from "./markdown.js";
import { truncate } from "../../shared/truncate.js";
import { LiteralUnion } from "type-fest";
import { ForegroundColorName } from "chalk";
import { JSONAttemptStringify } from "../../shared/jsonAttemptStringify.js";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";

function toolEntryFactory(
	index: number,
	checkpoint: Extract<CheckpointEntryTypes, { type: "tool" }>,
	color: LiteralUnion<ForegroundColorName, string>,
) {
	let resultText: string = "";
	switch (checkpoint.status) {
		case "done":
			resultText = `\n\r  ╰─── ${truncate(JSONAttemptStringify(checkpoint.result), 500)}`;
			break;
		case "error":
			resultText = `\n\r  ╰─── Error message: "${(JSON.parse(checkpoint.result) as Error).message}"`;
			break;
		case "rejected":
			resultText = `\n\r  ╰─── Security Rejection: "${checkpoint.result}"`;
			break;
	}
	return (
		<Box key={index} marginBottom={1}>
			<Text color={color}>
				{`⬤ ${checkpoint.toolName}(${truncate(JSON.stringify(checkpoint.arguments), 500)})`}
			</Text>
			<Text>{resultText}</Text>
		</Box>
	);
}

function reasoningFactory(
	history: CheckpointEntryTypes[],
	reasoningCheckpoint: Extract<CheckpointEntryTypes, { type: "reasoning" }>,
) {
	if (history.at(-1)! !== reasoningCheckpoint)
		return (
			<Text dimColor italic>
				{"🛈 "} {"Reasoning"}
			</Text>
		);

	return (
		<Box flexDirection="column">
			<Text dimColor italic>
				{"🛈 "} {"Reasoning"}
			</Text>

			<Box paddingLeft={2}>
				<Text dimColor italic>
					{reasoningCheckpoint.content}
				</Text>
			</Box>
		</Box>
	);
}

type HistoryProps = {
	history: CheckpointEntryTypes[];
};

export const History = ({ history }: HistoryProps) => {
	return (
		<Box flexDirection="column" marginTop={1}>
			{history.map((checkpoint: CheckpointEntryTypes, index: number) => {
				switch (checkpoint.type) {
					case "user": {
						return (
							<Box key={index} flexDirection="column" backgroundColor="#084a82" marginBottom={1}>
								<Text>
									{">"} {checkpoint.content}
								</Text>
							</Box>
						);
					}

					case "assistant": {
						return (
							<Box key={index} marginBottom={1}>
								<Text>▲ </Text>
								<Markdown>{checkpoint.content}</Markdown>
							</Box>
						);
					}

					case "reasoning": {
						return <Box key={index}>{reasoningFactory(history, checkpoint)}</Box>;
					}

					case "tool": {
						switch (checkpoint.status) {
							case "pending":
								return toolEntryFactory(index, checkpoint, "gray");

							case "done":
								return toolEntryFactory(index, checkpoint, "green");

							case "error":
								return toolEntryFactory(index, checkpoint, "red");
							case "rejected":
								return toolEntryFactory(index, checkpoint, "red");
						}
					}
				}
			})}
		</Box>
	);
};
