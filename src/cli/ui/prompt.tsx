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
	const cmdRegistry = client?.commandRegistry;

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
						if (cmdRegistry?.isCommand(trimPrompt)) return;

						// normal session stuff
						if (!session) return;
						if (session.getSessionData().isPending) return;
						if (trimPrompt.length === 0) return;
						onSubmit(trimPrompt);
						setPrompt("");
					}}
				/>
			</Box>
			<Divider />
			<CommandInformation prompt={prompt} />
		</Box>
	);
};
