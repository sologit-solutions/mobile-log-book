import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

/**
 * Run database migrations if needed.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 1;

    // Read current schema version
    const versionRow = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    const currentDbVersion = versionRow?.user_version ?? 0;

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    console.log(`Migrating database from version ${currentDbVersion} --> ${DATABASE_VERSION}`);

    if (currentDbVersion === 0) {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY NOT NULL,
        entry TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TRIGGER IF NOT EXISTS update_logs_timestamp
      AFTER UPDATE ON logs
      FOR EACH ROW
      BEGIN
        UPDATE logs
        SET updated_at = datetime('now')
        WHERE id = OLD.id;
      END;
    `);

        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    }
}

/**
 * Insert a new log row.
 */
export async function addLog(
    db: SQLiteDatabase,
    entry: string,
    latitude: number,
    longitude: number
) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await db.runAsync(
        `
    INSERT INTO logs (id, entry, latitude, longitude, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `,
        id,
        entry,
        latitude,
        longitude,
        timestamp
    );

    return id;
}

/**
 * Fetch all logs, newest first.
 */
export async function getLogs(db: SQLiteDatabase) {
    return db.getAllAsync(`
    SELECT * FROM logs
    ORDER BY timestamp DESC
  `);
}

/**
 * Fetch a singular log
 */
export async function getLogById(db: SQLiteDatabase, id: string) {
    return db.getFirstAsync(
        `SELECT * FROM logs WHERE id = ?`,
        id
    );
}

/**
 * Edit a log and let the trigger automatically update "updated_at".
 */
export async function updateLog(
    db: SQLiteDatabase,
    id: string,
    entry: string
) {
    await db.runAsync(
        `
    UPDATE logs
    SET entry = ?
    WHERE id = ?
  `,
        entry,
        id
    );
}

/**
 * Delete a log.
 */
export async function deleteLog(db: SQLiteDatabase, id: string) {
    await db.runAsync(
        `DELETE FROM logs WHERE id = ?`,
        id
    );
}