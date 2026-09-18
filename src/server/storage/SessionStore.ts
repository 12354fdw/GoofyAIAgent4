import Database from "better-sqlite3";
import path from "path";
import { DATA_DIRECTORY } from "../../shared/globals/index.js";

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

		this.sessionsDataDb.exec(`CREATE TABLE IF NOT EXISTS sessions (
			session_name	TEXT PRIMARY KEY,
			usage 			TEXT
		)`);
	}

	public static getInstance() {
		if (!SessionStore.instance) SessionStore.instance = new SessionStore();
		return SessionStore.instance;
	}
}
