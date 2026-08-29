import { Box, Text } from "ink";
import { CheckpointTypes } from "../../shared/checkpointTypes.js";

type HistoryProps = {
	history: CheckpointTypes[];
};

export const History = ({ history }: HistoryProps) => {
	return (
		<Box flexDirection="column" marginTop={1}>
			{history.map((checkpoint: CheckpointTypes, index: number) => {
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
								<Text>⬤ {checkpoint.content}</Text>
							</Box>
						);
					}
				}
			})}
		</Box>
	);
};
