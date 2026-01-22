import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

/**
 * Run database migrations if needed.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 3; // INCREMENTED TO 3

    // Read current schema version
    const versionRow = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    const currentDbVersion = versionRow?.user_version ?? 0;

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    console.log(`Migrating database from version ${currentDbVersion} --> ${DATABASE_VERSION}`);

    // Version 1: Logs Table
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
    }

    // Version 2: Vessels Table
    if (currentDbVersion < 2) {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS vessels (
                                                   id TEXT PRIMARY KEY NOT NULL,
                                                   name TEXT NOT NULL,
                                                   type TEXT NOT NULL,
                                                   registration TEXT,
                                                   created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        `);
    }

    // Version 3: Add vessel_id to logs
    if (currentDbVersion < 3) {
        // We use ALTER TABLE to add the column to the existing table
        await db.execAsync(`
            ALTER TABLE logs ADD COLUMN vessel_id TEXT;
        `);
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

// --- LOG FUNCTIONS ---

export async function addLog(
    db: SQLiteDatabase,
    entry: string,
    latitude: number,
    longitude: number,
    vesselId: string | null = null // NEW PARAMETER
) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await db.runAsync(
        `INSERT INTO logs (id, entry, latitude, longitude, timestamp, vessel_id) VALUES (?, ?, ?, ?, ?, ?)`,
        id, entry, latitude, longitude, timestamp, vesselId
    );
    return id;
}

export async function getLogs(db: SQLiteDatabase) {
    // We can join vessels here later if we want to show vessel names in the list
    return db.getAllAsync(`
        SELECT logs.*, vessels.name as vessel_name
        FROM logs
                 LEFT JOIN vessels ON logs.vessel_id = vessels.id
        ORDER BY timestamp DESC
    `);
}

export async function getLogById(db: SQLiteDatabase, id: string) {
    return db.getFirstAsync(
        `SELECT logs.*, vessels.name as vessel_name
         FROM logs
                  LEFT JOIN vessels ON logs.vessel_id = vessels.id
         WHERE logs.id = ?`,
        id
    );
}

export async function updateLog(db: SQLiteDatabase, id: string, entry: string) {
    await db.runAsync(`UPDATE logs SET entry = ? WHERE id = ?`, entry, id);
}

export async function deleteLog(db: SQLiteDatabase, id: string) {
    await db.runAsync(`DELETE FROM logs WHERE id = ?`, id);
}

// --- VESSEL FUNCTIONS ---

export async function addVessel(
    db: SQLiteDatabase,
    name: string,
    type: string,
    registration: string
) {
    const id = uuidv4();
    await db.runAsync(
        `INSERT INTO vessels (id, name, type, registration) VALUES (?, ?, ?, ?)`,
        id, name, type, registration
    );
    return id;
}

export async function getVessels(db: SQLiteDatabase) {
    return db.getAllAsync(`SELECT * FROM vessels ORDER BY created_at DESC`);
}

export async function deleteVessel(db: SQLiteDatabase, id: string) {
    await db.runAsync(`DELETE FROM vessels WHERE id = ?`, id);
}