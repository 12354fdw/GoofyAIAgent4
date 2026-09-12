import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { Logger, type ILogObj, type IMeta, type LogFormatter } from "tslog";
import { fileTransport } from "tslog/transports/file";

const LOGS_DIR = "logs";
const LATEST_LOG = path.join(LOGS_DIR, "latest.log");
const MAX_ARCHIVES_PER_DAY = 1000;

function archiveLatestLog(): void {
	mkdirSync(LOGS_DIR, { recursive: true });

	let stat;
	try {
		stat = statSync(LATEST_LOG);
	} catch {
		return;
	}
	if (!stat.isFile()) return;

	const now = new Date();
	const date = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
	].join("-");

	let archive = "";
	for (let index = 1; index <= MAX_ARCHIVES_PER_DAY; index++) {
		const candidate = path.join(LOGS_DIR, `${date}-${index}.log.gz`);
		if (!existsSync(candidate)) {
			archive = candidate;
			break;
		}
	}
	if (!archive) return;

	try {
		writeFileSync(archive, gzipSync(readFileSync(LATEST_LOG)));
		rmSync(LATEST_LOG);
	} catch {
		//
	}
}

function formatTimestamp(date: Date): string {
	const pad = (value: number, length = 2) => String(value).padStart(length, "0");
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function stringifyLogValue(value: unknown): string {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}

function formatError(value: unknown): string {
	if (value && typeof value === "object") {
		const error = value as Record<string, unknown>;
		const name = typeof error.name === "string" ? error.name : "Error";
		const message = typeof error.message === "string" ? error.message : "";
		const frames = Array.isArray(error.stack) ? (error.stack as Array<{ fileNameWithLine?: string }>) : [];
		const stack = frames
			.filter((frame) => frame.fileNameWithLine)
			.map((frame) => `\tat ${frame.fileNameWithLine}`)
			.join("\n");
		return stack ? `${name}: ${message}\n${stack}` : `${name}: ${message}`;
	}
	return stringifyLogValue(value);
}

function isSerializedError(value: unknown): value is Record<string, unknown> {
	return (
		value !== null &&
		typeof value === "object" &&
		typeof (value as Record<string, unknown>).name === "string" &&
		typeof (value as Record<string, unknown>).message === "string" &&
		Array.isArray((value as Record<string, unknown>).stack)
	);
}

const FILE_LOG_FORMAT: LogFormatter<ILogObj> = (record, settings) => {
	const meta = record[settings.meta.property] as IMeta;
	const parts: string[] = [];
	for (const [key, value] of Object.entries(record)) {
		if (key === settings.meta.property) continue;
		if (key === settings.json.messageKey || key === "0") {
			parts.push(stringifyLogValue(value));
		} else if (key === settings.json.errorKey || isSerializedError(value)) {
			parts.push(formatError(value));
		} else if (/^\d+$/.test(key)) {
			parts.push(stringifyLogValue(value));
		} else {
			parts.push(`${key}=${stringifyLogValue(value)}`);
		}
	}
	return `[${formatTimestamp(meta.date)}] [${meta.logLevelName}]: ${parts.join(" ")}`;
};

archiveLatestLog();

export const LOGGER = new Logger({
	attachedTransports: [
		fileTransport({
			path: LATEST_LOG,
			format: FILE_LOG_FORMAT,
		}),
	],
});
