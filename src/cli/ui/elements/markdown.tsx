import { Text } from "ink";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";

interface MarkdownProps {
	children: string;
}

export const Markdown = ({ children }: MarkdownProps) => {
	const output = marked(children, { renderer: new TerminalRenderer() });
	return <Text>{output.trim()}</Text>;
};
