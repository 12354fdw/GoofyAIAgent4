import { useContext } from "react";
import { ClientContext } from "../clientContext.js";
import { Client } from "../../../client/client.js";
import { Box, Text } from "ink";
import { Divider } from "../elements/divider.js";

type CommandDetailsProps = {
	prompt: string;
};

export const CommandDetails = ({ prompt }: CommandDetailsProps) => {
	const client = useContext(ClientContext) as Client;
	const cmdRegistry = client.commandRegistry;

	const promptInformation = cmdRegistry.extractCommandInformation(prompt);
	const cmd = cmdRegistry.getCommand(promptInformation.commandName);

	return (
		<Box flexDirection="column">
			<Text italic>Command Details</Text>
			<Divider />
		</Box>
	);
};
