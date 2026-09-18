import Database from "better-sqlite3";
import path from "path";
import { DATA_DIRECTORY } from "../../shared/globals/index.js";

export class SessionStore {
	private static instance: SessionStore;
	private sessionsDb = new Database(path.join(DATA_DIRECTORY, "sessions.sqlite3"));

	private constructor() {
		this.sessionsDb.exec(`
			PRAGMA journal_mode = WAL;
			PRAGMA synchronous = NORMAL;
			PRAGMA foreign_keys = ON;
			PRAGMA user_version = 1;
		`);

		this.sessionsDb.exec(`CREATE TABLE IF NOT EXISTS sessions (
			session_name	TEXT PRIMARY KEY,

			usage 			TEXT,
			checkpoints 	TEXT,
			model_messages	TEXT
		)`);
	}

	public static getInstance() {
		if (!SessionStore.instance) SessionStore.instance = new SessionStore();
		return SessionStore.instance;
	}
}
