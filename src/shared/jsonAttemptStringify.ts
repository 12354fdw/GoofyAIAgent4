// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JSONAttemptStringify(value: any) {
	try {
		return JSON.stringify(value);
	} catch {
		return value;
	}
}
