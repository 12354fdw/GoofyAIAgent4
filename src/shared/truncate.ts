export function truncate(text: string, maxLength: number, ellipsis = "\u2026"): string {
	if (text.length <= maxLength) {
		return text;
	}

	const ellipsisLength = ellipsis.length;
	if (maxLength <= ellipsisLength) {
		return ellipsis.slice(0, maxLength);
	}

	return text.slice(0, maxLength - ellipsisLength) + ellipsis;
}
