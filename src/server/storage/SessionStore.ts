import Database from "better-sqlite3";
import path from "path";
import { DATA_DIRECTORY } from "../../shared/globals/index.js";
import { LOGGER } from "../../shared/globals/logger.js";
import { dbSessionData } from "./types/dbSessionData.js";
import { Session } from "../agent/session/session.js";
import { formatSIPrefix } from "../../shared/SIPrefixer.js";
import { NetworkedCheckpointDeltaData } from "../../shared/checkpoints/networkedCheckpoints.js";
import { SessionParameters } from "../agent/sessionController.js";

export const DATABASE_SCHEMA_VERSION = 1;

function getDbFromName(dbName: string) {
	const db = new Database(path.join(DATA_DIRECTORY, "db", `${dbName}.sqlite3`));
	db.exec(`
			PRAGMA journal_mode = WAL;
			PRAGMA synchronous = NORMAL;
			PRAGMA foreign_keys = ON;
	`);

	const version = db.pragma("user_version", { simple: true }) as number;
	if (version !== 0 && version !== DATABASE_SCHEMA_VERSION) {
		throw new Error("data migration not implemented yet!");
	}

	db.exec(`PRAGMA user_version = ${DATABASE_SCHEMA_VERSION}`);

	return db;
}

function sanitizeSessionName(sessionName: string) {
	return `"${sessionName.replaceAll('"', '""')}"`;
}

export class SessionStore {
	private static instance: SessionStore;
	private readonly sessionsDataDb = getDbFromName("sessionsData");
	private readonly sessionsCheckpointDb = getDbFromName("sessionsCheckpoints");
	private readonly sessionsMessagesDb = getDbFromName("sessionsModelMessages");

	private constructor() {
		this.sessionsDataDb.exec(`
			PRAGMA journal_mode = WAL;
			PRAGMA synchronous = NORMAL;
			PRAGMA foreign_keys = ON;
			PRAGMA user_version = ${DATABASE_SCHEMA_VERSION};
		`);

		this.sessionsDataDb.exec(
			`CREATE TABLE IF NOT EXISTS sessions (
			session_name		TEXT PRIMARY KEY NOT NULL,
			session_parameter	JSONB NOT NULL,
			usage 				JSONB NOT NULL
		)`,
		);
	}

	public static getInstance() {
		if (!SessionStore.instance) SessionStore.instance = new SessionStore();
		return SessionStore.instance;
	}

	public newSessionEntry(sessionName: string, sessionParameters: SessionParameters) {
		this.sessionsDataDb
			.prepare(
				`INSERT INTO sessions (session_name, session_parameter, usage)
				VALUES (@sessionName, @sessionParameters, '')
			`,
			)
			.run({
				sessionName,
				sessionParameters: JSON.stringify(sessionParameters),
			});

		this.sessionsCheckpointDb.exec(
			`CREATE TABLE IF NOT EXISTS ${sanitizeSessionName(sessionName)} (
			idx			INTEGER PRIMARY KEY AUTOINCREMENT,
			entry		JSONB NOT NULL
	)`,
		);
	}

	//

	public loadSessions() {
		LOGGER.info("Loading sessions");
		const start = performance.now();

		const sessionsData = dbSessionData.parse(
			this.sessionsDataDb
				.prepare(
					`SELECT session_name AS sessionName,
						json(session_parameter) AS sessionParameter,
						json(usage) AS usage
					 FROM sessions`,
				)
				.all(),
		);

		LOGGER.info(`Loaded sessions in ${formatSIPrefix((performance.now() - start) / 1000)}s`);

		return sessionsData;
	}

	public saveSessionData(session: Session) {
		const name = session.sessionName;
		const sessionParameters = session.getSessionParameters();
		const usage = session.getSessionData().usage;

		this.sessionsDataDb
			.prepare(
				`INSERT INTO sessions (session_name, session_parameter, usage)
				 VALUES (@sessionName, @sessionParameter, @usage)
				 ON CONFLICT(session_name) DO UPDATE SET
					session_parameter = excluded.session_parameter,
					usage = excluded.usage`,
			)
			.run({
				sessionName: name,
				sessionParameter: JSON.stringify(sessionParameters),
				usage: JSON.stringify(usage),
			});
	}

	//

	public appendCheckpointHistory(sessionName: string, delta: NetworkedCheckpointDeltaData) {
		switch (delta.type) {
			case "entry_addition": {
				this.sessionsCheckpointDb
					.prepare(
						`INSERT INTO ${sanitizeSessionName(sessionName)} (entry)
						VALUES (@entry)
					`,
					)
					.run({
						entry: JSON.stringify(delta.content),
					});
				break;
			}

			case "entry_modification": {
				this.sessionsCheckpointDb
					.prepare(
						`UPDATE ${sanitizeSessionName(sessionName)}
						SET entry = @entry
						WHERE idx = @index
					`,
					)
					.run({
						index: delta.index,
						entry: JSON.stringify(delta.content),
					});
				break;
			}
		}
	}
}
