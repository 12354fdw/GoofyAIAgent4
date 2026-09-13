import { useContext } from "react";
import { ClientContext } from "../clientContext.js";
import { Box, Text } from "ink";
import { Client } from "../../../client/client.js";
import { Divider } from "../elements/divider.js";

type CommandSuggestionsProps = {
	prompt: string;
};

export const CommandSuggestions = ({ prompt }: CommandSuggestionsProps) => {
	const client = useContext(ClientContext) as Client;
	const cmdRegistry = client.commandRegistry;

	const commands = cmdRegistry
		.getCompletions(prompt)
		.sort((a, b) => a.localeCompare(b))
		.slice(0, 5);

	return (
		<Box flexDirection="column">
			<Text italic>Command Suggestions:</Text>
			{commands.length === 0 ? (
				<Text dimColor italic>
					{"  No commands found"}
				</Text>
			) : (
				commands.map((command) => (
					<Text key={command} dimColor italic>
						{`  ${command}`}
					</Text>
				))
			)}
			<Divider />
		</Box>
	);
};
