import { useContext } from "react";
import { ClientContext } from "./clientContext.js";
import { CommandSuggestions } from "./commands/commandSuggestions.js";
import { CommandDetails } from "./commands/commandDetails.js";

type CommandInformationProps = {
	prompt: string;
};

export const CommandInformation = ({ prompt }: CommandInformationProps) => {
	const client = useContext(ClientContext);
	const cmdRegistry = client?.cmdSystem.cmdRegistry;

	if (!cmdRegistry?.isCommand(prompt)) return;

	const details = cmdRegistry.extractCommandInformation(prompt);
	const hasSpaceAfterCommand = /^\s*\S+\s+/.test(prompt.slice(1));
	return cmdRegistry.isValidCommandName(details.commandName) && hasSpaceAfterCommand ? (
		<CommandDetails prompt={prompt} />
	) : (
		<CommandSuggestions prompt={prompt} />
	);
};
