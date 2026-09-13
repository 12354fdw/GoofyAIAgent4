import { Box, Text } from "ink";
import { useContext, useState } from "react";
import { Divider } from "./divider.js";
import TextInput from "ink-text-input";
import { ClientContext } from "./clientContext.js";

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
					onChange={(prompt: string) => {
						setPrompt(prompt);

						if (!cmdRegistry?.isCommand(prompt)) return;
						console.log(cmdRegistry.getCompletions(prompt));
					}}
					onSubmit={() => {
						if (!session) return;
						if (session.getSessionData().isPending) return;

						const trimPrompt = prompt.trim();
						if (trimPrompt.length === 0) return;
						onSubmit(trimPrompt);
						setPrompt("");
					}}
				/>
			</Box>
			<Divider />
		</Box>
	);
};
