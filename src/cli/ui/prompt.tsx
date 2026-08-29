import { Box, Text } from "ink";
import { useState } from "react";
import { Divider } from "./divider.js";
import TextInput from "ink-text-input";

export const Prompt = () => {
	const [prompt, setPrompt] = useState("");

	return (
		<Box flexDirection="column">
			<Divider />
			<Box>
				<Text>{"> "}</Text>
				<TextInput value={prompt} onChange={setPrompt} />
			</Box>
			<Divider />
		</Box>
	);
};
