import { Box, Text } from "ink";
import type { BoxProps, TextProps } from "ink";
import type { BoxStyle } from "cli-boxes";

interface DividerProps {
	title?: string;
	width?: "auto" | number;
	padding?: number;
	titlePadding?: number;
	titleColor?: TextProps["color"];
	dividerChar?: string;
	dividerColor?: BoxProps["borderColor"];
	boxProps?: BoxProps;
}

const DividerLine = ({
	dividerChar,
	dividerColor = "gray",
	boxProps,
}: Pick<Required<DividerProps>, "dividerColor"> & Pick<DividerProps, "dividerChar" | "boxProps">) => {
	const lineStyle: BoxStyle = {
		topLeft: "",
		top: "",
		topRight: "",
		right: "",
		bottomRight: "",
		bottom: dividerChar ?? "─",
		bottomLeft: "",
		left: "",
	};

	return (
		<Box
			width="auto"
			borderStyle={lineStyle}
			borderColor={dividerColor}
			flexGrow={1}
			borderBottom
			borderTop={false}
			borderLeft={false}
			borderRight={false}
			{...boxProps}
		/>
	);
};

export const Divider = ({
	title,
	width = "auto",
	padding = 0,
	titlePadding = 1,
	titleColor = "white",
	dividerChar = "─",
	dividerColor = "gray",
	boxProps,
}: DividerProps) => {
	const line = <DividerLine dividerChar={dividerChar} dividerColor={dividerColor} boxProps={boxProps} />;

	return title ? (
		<Box width={width} paddingLeft={padding} paddingRight={padding} gap={titlePadding}>
			{line}
			<Box>
				<Text color={titleColor}>{title}</Text>
			</Box>
			{line}
		</Box>
	) : (
		<Box paddingLeft={padding} paddingRight={padding}>
			{line}
		</Box>
	);
};
