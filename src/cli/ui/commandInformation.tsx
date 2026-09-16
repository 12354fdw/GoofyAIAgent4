import { useContext } from "react";
import { ClientContext } from "./clientContext.js";
import { CommandSuggestions } from "./commands/commandSuggestions.js";
import { CommandDetails } from "./commands/commandDetails.js";

type CommandInformationProps = {
	prompt: string;
};

export const CommandInformation = ({ prompt }: CommandInformationProps) => {
	const client = useContext(ClientContext);
	const registry = client?.cmdSystem.registry;

	if (!registry?.looksLikeCommand(prompt)) return;

	const details = registry.parse(prompt);
	const hasSpaceAfterCommand = /^\s*\S+\s+/.test(prompt.slice(1));
	return registry.has(details.name) && hasSpaceAfterCommand ? (
		<CommandDetails prompt={prompt} />
	) : (
		<CommandSuggestions prompt={prompt} />
	);
};
