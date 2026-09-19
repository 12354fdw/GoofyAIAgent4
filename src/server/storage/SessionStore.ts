import Database from "better-sqlite3";
import path from "path";
import { ModelMessage } from "ai";
import { CheckpointEntryTypes } from "../../shared/checkpoints/checkpointTypes.js";
import { DATA_DIRECTORY } from "../../shared/globals/index.js";
import { LOGGER } from "../../shared/globals/logger.js";
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

export class SessionStore {
	private static instance: SessionStore;
	private readonly db = getDbFromName("sessionStore");

	private constructor() {
		this.db.exec(
			`CREATE TABLE IF NOT EXISTS sessions (
				session_name		TEXT PRIMARY KEY NOT NULL,
				session_parameter	JSONB NOT NULL,
				usage				JSONB NOT NULL
			);

			CREATE TABLE IF NOT EXISTS checkpoints (
				session_name	TEXT NOT NULL,
				idx				INTEGER NOT NULL,
				entry			JSONB NOT NULL,
				PRIMARY KEY (session_name, idx),
				FOREIGN KEY (session_name) REFERENCES sessions(session_name) ON DELETE CASCADE
			);

			CREATE TABLE IF NOT EXISTS model_messages (
				session_name	TEXT NOT NULL,
				idx				INTEGER NOT NULL,
				entry			JSONB NOT NULL,
				PRIMARY KEY (session_name, idx),
				FOREIGN KEY (session_name) REFERENCES sessions(session_name) ON DELETE CASCADE
			);
		`,
		);
	}

	public static getInstance() {
		if (!SessionStore.instance) SessionStore.instance = new SessionStore();
		return SessionStore.instance;
	}

	public newSessionEntry(sessionName: string, sessionParameters: SessionParameters) {
		this.db
			.prepare(
				`INSERT INTO sessions (session_name, session_parameter, usage)
				VALUES (@sessionName, @sessionParameters, '')
			`,
			)
			.run({
				sessionName,
				sessionParameters: JSON.stringify(sessionParameters),
			});
	}

	//

	public loadSessions() {
		LOGGER.info("Loading sessions");
		const start = performance.now();

		const rows = this.db
			.prepare(
				`SELECT session_name AS sessionName,
				json(session_parameter) AS sessionParameter,
				json(usage) AS usage
				FROM sessions`,
			)
			.all();

		LOGGER.info(`Loaded sessions in ${formatSIPrefix((performance.now() - start) / 1000)}s`);

		return (rows as { sessionName: string; sessionParameter: string; usage: string }[]).map(
			({ sessionName, sessionParameter, usage }) => {
				return {
					sessionName,
					sessionParameter,
					usage,
				};
			},
		);
	}

	public saveSessionData(session: Session) {
		const name = session.sessionName;
		const sessionParameters = session.getSessionParameters();
		const usage = session.getSessionData().usage;

		this.db
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
				this.db
					.prepare(
						`INSERT INTO checkpoints (session_name, idx, entry)
						SELECT @sessionName, COALESCE(MAX(idx), 0) + 1, @entry
						FROM checkpoints
						WHERE session_name = @sessionName
					`,
					)
					.run({
						sessionName,
						entry: JSON.stringify(delta.content),
					});
				break;
			}

			case "entry_modification": {
				this.db
					.prepare(
						`UPDATE checkpoints
						SET entry = @entry
						WHERE session_name = @sessionName AND idx = @index
					`,
					)
					.run({
						sessionName,
						index: delta.index,
						entry: JSON.stringify(delta.content),
					});
				break;
			}
		}
	}

	public loadCheckpoints(sessionName: string) {
		const rows = this.db
			.prepare(
				`SELECT json(entry) AS entry
				FROM checkpoints
				WHERE session_name = ?
				ORDER BY idx ASC
			`,
			)
			.all(sessionName) as { entry: string }[];

		return rows.map(({ entry }) => JSON.parse(entry) as CheckpointEntryTypes);
	}

	//

	public appendModelMessage(sessionName: string, message: ModelMessage) {
		this.db
			.prepare(
				`INSERT INTO model_messages (session_name, idx, entry)
				SELECT @sessionName, COALESCE(MAX(idx), 0) + 1, @entry
				FROM model_messages
				WHERE session_name = @sessionName
			`,
			)
			.run({
				sessionName,
				entry: JSON.stringify(message),
			});
	}

	public loadModelMessages(sessionName: string) {
		const rows = this.db
			.prepare(
				`SELECT json(entry) AS entry
				FROM model_messages
				WHERE session_name = ?
				ORDER BY idx ASC
			`,
			)
			.all(sessionName) as { entry: string }[];

		return rows.map(({ entry }) => JSON.parse(entry) as ModelMessage);
	}
}
