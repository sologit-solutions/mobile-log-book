import "react-native-get-random-values";
import { type SQLiteDatabase } from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import { DBLogItem, DBLogbook } from "@/src/types/db";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const DATABASE_VERSION = 4;

	const versionRow = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
	const currentDbVersion = versionRow?.user_version ?? 0;

	console.log(`Current DB Version: ${currentDbVersion}. Target Version: ${DATABASE_VERSION}`);

	if (currentDbVersion >= DATABASE_VERSION) {
		console.log("Database is up to date.");

		return;
	}

	console.log(`Starting Database Migration to v${DATABASE_VERSION}...`);

	await db.execAsync("PRAGMA foreign_keys = ON");

	await db.execAsync(`
		DROP TABLE IF EXISTS vessels;
		DROP TABLE IF EXISTS logs;
	`);

	await db.execAsync(`
        CREATE TABLE IF NOT EXISTS logbooks (
			id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            registration TEXT,
            owner_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            version INTEGER DEFAULT 0
        );
    `);

	// Create Logs Table
	await db.execAsync(`
        CREATE TABLE IF NOT EXISTS log_items (
			id TEXT PRIMARY KEY NOT NULL,
            logbook_id TEXT NOT NULL,
            title TEXT NOT NULL,
            body TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            version INTEGER DEFAULT 0,
            FOREIGN KEY (logbook_id) REFERENCES logbooks(id) ON DELETE CASCADE
        );
    `);

	// Update version
	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
	console.log("Database Migration Complete.");
}

// --- LOG FUNCTIONS ---

export async function addLogItem(
	db: SQLiteDatabase,
	logbookId: string,
	title: string,
	body: string | null,
	latitude: number,
	longitude: number,
): Promise<string> {
	const id = uuidv4();
	const now = new Date().toISOString();

	await db.runAsync(
		`INSERT INTO log_items (id, logbook_id, title, body, latitude, longitude, created_at, updated_at, version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id,
		logbookId,
		title,
		body,
		latitude,
		longitude,
		now, // created_at
		now, // updated_at
		0, // initial sync version
	);
	return id;
}

export async function getLogItems(db: SQLiteDatabase, logbookId?: string): Promise<DBLogItem[]> {
	if (logbookId) {
		return db.getAllAsync<DBLogItem>(`SELECT * FROM log_items WHERE logbook_id = ? ORDER BY created_at DESC`, logbookId);
	}
	return db.getAllAsync<DBLogItem>(`SELECT * FROM log_items ORDER BY created_at DESC`);
}

export async function getLogItemById(db: SQLiteDatabase, id: string): Promise<DBLogItem | null> {
	return db.getFirstAsync<DBLogItem>(`SELECT * FROM log_items WHERE id = ?`, id);
}

export const updateLogItem = async (db: SQLiteDatabase, id: string, title: string, body: string | null, lat?: number, lon?: number) => {
	const now = new Date().toISOString();

	if (lat !== undefined && lon !== undefined) {
		return await db.runAsync("UPDATE log_items SET title = ?, body = ?, latitude = ?, longitude = ?, updated_at = ? WHERE id = ?", [
			title,
			body,
			lat,
			lon,
			now,
			id,
		]);
	} else {
		return await db.runAsync("UPDATE log_items SET title = ?, body = ?, updated_at = ? WHERE id = ?", [title, body, now, id]);
	}
};

export async function deleteLogItem(db: SQLiteDatabase, id: string): Promise<void> {
	await db.runAsync(`DELETE FROM log_items WHERE id = ?`, id);
}

// --- VESSEL FUNCTIONS ---

export async function addLogbook(db: SQLiteDatabase, name: string, type: string, registration: string): Promise<string> {
	const id = uuidv4();
	const now = new Date().toISOString();
	await db.runAsync(
		`INSERT INTO logbooks (id, name, type, registration, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		id,
		name,
		type,
		registration,
		now,
		now,
		0,
	);
	return id;
}

export async function getLogbooks(db: SQLiteDatabase): Promise<DBLogbook[]> {
	return db.getAllAsync<DBLogbook>(`SELECT * FROM logbooks ORDER BY created_at DESC`);
}

export async function deleteLogbook(db: SQLiteDatabase, id: string): Promise<void> {
	await db.runAsync(`DELETE FROM logbooks WHERE id = ?`, id);
}
