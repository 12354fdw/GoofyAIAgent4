import { Box, Text } from "ink";
import { useState } from "react";
import { Divider } from "./divider.js";
import TextInput from "ink-text-input";

type PromptProps = {
	onSubmit: (prompt: string) => void;
};

export const Prompt = ({ onSubmit }: PromptProps) => {
	const [prompt, setPrompt] = useState("");

	return (
		<Box flexDirection="column" marginTop={1}>
			<Divider />
			<Box>
				<Text color="blue">{"> "}</Text>
				<TextInput
					value={prompt}
					onChange={setPrompt}
					onSubmit={() => {
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
