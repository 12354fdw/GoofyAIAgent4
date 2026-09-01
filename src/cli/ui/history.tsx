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
	return (
		<Box key={index} marginTop={1}>
			<Text color={color}>⬤ </Text>
			<Text>
				{checkpoint.toolName}({truncate(JSON.stringify(checkpoint.arguments), 50)})
			</Text>
			<Text>
				{checkpoint.status !== "pending"
					? `\n\r  ╰─── ${truncate(JSONAttemptStringify(checkpoint.result), 50)}`
					: ""}
			</Text>
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
							<Box key={index} flexDirection="column" backgroundColor="#084a82" marginTop={1}>
								<Text>
									{">"} {checkpoint.content}
								</Text>
							</Box>
						);
					}

					case "assistant": {
						return (
							<Box key={index} marginTop={1}>
								<Text>▲ </Text>
								<Markdown>{checkpoint.content}</Markdown>
							</Box>
						);
					}

					case "tool": {
						switch (checkpoint.status) {
							case "pending":
								return toolEntryFactory(index, checkpoint, "gray");

							case "done":
								return toolEntryFactory(index, checkpoint, "green");

							case "rejected":
								return toolEntryFactory(index, checkpoint, "red");
						}
					}
				}
			})}
		</Box>
	);
};
