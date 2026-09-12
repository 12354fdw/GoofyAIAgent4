import { Box, Text } from "ink";
import { useContext, useState } from "react";
import { Divider } from "./divider.js";
import TextInput from "ink-text-input";
import { SessionContext } from "./sessionContext.js";

type PromptProps = {
	onSubmit: (prompt: string) => void;
};

export const Prompt = ({ onSubmit }: PromptProps) => {
	const [prompt, setPrompt] = useState("");
	const session = useContext(SessionContext);

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
						if (!session) return;
						if (session.getSessionData().isPending) return;
						if (prompt.length === 0) return;
						onSubmit(prompt);
						setPrompt("");
					}}
				/>
			</Box>
			<Divider />
		</Box>
	);
};
