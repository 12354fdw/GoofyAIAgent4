import { Box, Text } from "ink";
import { Markdown } from "./elements/markdown.js";
import { truncate } from "../../shared/truncate.js";
import { LiteralUnion } from "type-fest";
import { ForegroundColorName } from "chalk";
import { JSONAttemptStringify } from "../../shared/jsonAttemptStringify.js";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";

function sanitizeAndTruncate(text: unknown, truncation: number = 100) {
	return truncate(String(text).replace(/[\p{Cc}]/gu, " "), truncation);
}

function toolEntryFactory(
	index: number,
	checkpoint: Extract<CheckpointEntryTypes, { type: "tool" }>,
	color: LiteralUnion<ForegroundColorName, string>,
) {
	let resultText: string = "";
	switch (checkpoint.status) {
		case "done":
			resultText = `${sanitizeAndTruncate(JSONAttemptStringify(checkpoint.result))}`;
			break;
		case "error":
			resultText = `Error message: "${sanitizeAndTruncate((JSON.parse(checkpoint.result) as Error).message)}"`;
			break;
		case "rejected":
			resultText = `Security Rejection: "${sanitizeAndTruncate(checkpoint.result)}"`;
			break;
	}
	return (
		<Box key={index} flexDirection="column" marginBottom={1}>
			<Box>
				<Text color={color}>{"⬤"}</Text>
				<Text>{sanitizeAndTruncate(` ${checkpoint.toolName}(${JSON.stringify(checkpoint.arguments)})`)}</Text>
			</Box>
			<Text>
				{resultText !== "" ? "  ╰───" : ""} {resultText}
			</Text>
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

					case "error": {
						return (
							<Box
								key={index}
								flexDirection="column"
								height={3}
								backgroundColor="#3d0000"
								marginTop={1}
								marginBottom={1}
							>
								<Text color="red" bold>{`\n  /!\\  ${checkpoint.message}`}</Text>
							</Box>
						);
					}

					case "command_message": {
						return (
							<Box key={index} flexDirection="column" backgroundColor="#084a82" marginBottom={1}>
								<Box paddingLeft={2}>
									<Text>{`\n${checkpoint.content}\n`}</Text>
								</Box>
							</Box>
						);
					}

					case "command_error": {
						return (
							<Box
								key={index}
								flexDirection="column"
								height={3}
								backgroundColor="#3d0000"
								marginBottom={1}
							>
								<Text color="red" bold>
									{`\n  / ! \\ ${checkpoint.content}`}
								</Text>
							</Box>
						);
					}
				}
			})}
		</Box>
	);
};
