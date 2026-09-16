import { Box, Text } from "ink";
import { useContext, useState } from "react";
import { Divider } from "./elements/divider.js";
import TextInput from "ink-text-input";
import { ClientContext } from "./clientContext.js";
import { CommandInformation } from "./commandInformation.js";

type PromptProps = {
	onSubmit: (prompt: string) => void;
};

export const Prompt = ({ onSubmit }: PromptProps) => {
	const [prompt, setPrompt] = useState("");
	const client = useContext(ClientContext);
	const session = client?.currentSession ?? null;
	const registry = client?.cmdSystem.registry;

	const handleCommand = (trimPrompt: string) => {
		if (!registry?.isValidCommand(trimPrompt)) return;
		client?.executeCommand(trimPrompt);
		setPrompt("");
	};

	const handleUserPrompt = (trimPrompt: string) => {
		if (!session) return;
		if (session.getSessionData().isPending) return;
		if (trimPrompt.length === 0) return;
		onSubmit(trimPrompt);
		setPrompt("");
	};

	return (
		<Box flexDirection="column">
			<Divider />
			<Box>
				<Text color="blue">{"> "}</Text>
				<TextInput
					placeholder={session !== null ? `  ${session.getSessionData().lastUserPrompt}` : "[No Session]"}
					value={prompt}
					onChange={setPrompt}
					onSubmit={() => {
						const trimPrompt = prompt.trim();
						if (registry?.looksLikeCommand(trimPrompt)) {
							handleCommand(trimPrompt);
							return;
						}

						handleUserPrompt(trimPrompt);
					}}
				/>
			</Box>
			<Divider />
			<CommandInformation prompt={prompt} />
		</Box>
	);
};
