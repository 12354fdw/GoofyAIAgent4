import { useContext } from "react";
import { ClientContext } from "./clientContext.js";
import { CommandSuggestions } from "./commands/commandSuggestions.js";

type CommandInformationProps = {
	prompt: string;
};

export const CommandInformation = ({ prompt }: CommandInformationProps) => {
	const client = useContext(ClientContext);
	const cmdRegistry = client?.commandRegistry;

	if (!cmdRegistry?.isCommand(prompt)) return;

	return <CommandSuggestions prompt={prompt} />;
};
