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
	const registry = client.cmdSystem.registry;

	const parsed = registry.parse(prompt);
	const cmd = registry.get(parsed.name);

	return (
		<Box flexDirection="column">
			<Text italic bold>
				Command Parameters:
			</Text>

			{cmd.parameters.map(({ name, type }, idx) => {
				return (
					<Text italic dimColor key={idx}>
						{`  ${name.padEnd(6)}`} ({type.type.padEnd(5)}) = {parsed.args[idx]}
					</Text>
				);
			})}
			<Divider />
		</Box>
	);
};
