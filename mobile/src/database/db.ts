import 'react-native-get-random-values';
import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { DBLog, DBVessel } from '@/src/types/db';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 1;

    const versionRow = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    const currentDbVersion = versionRow?.user_version ?? 0;

    console.log(`Current DB Version: ${currentDbVersion}. Target Version: ${DATABASE_VERSION}`);

    if (currentDbVersion >= DATABASE_VERSION) {
        console.log("Database is up to date.");
        return;
    }

    console.log("Starting Database Migration...");

    await db.execAsync('PRAGMA foreign_keys = ON');

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS vessels (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            type TEXT,
            registration TEXT,
            created_at TEXT NOT NULL
        );
    `);

    // Create Logs Table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY NOT NULL,
            entry TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            timestamp TEXT NOT NULL,
            vessel_id TEXT,
            FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL
        );
    `);

    // Update version
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log("Database Migration Complete.");
}

// --- LOG FUNCTIONS ---

export async function addLog(
    db: SQLiteDatabase,
    entry: string,
    latitude: number,
    longitude: number,
    vesselId: string | null = null
): Promise<string> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await db.runAsync(
        `INSERT INTO logs (id, entry, latitude, longitude, timestamp, vessel_id) VALUES (?, ?, ?, ?, ?, ?)`,
        id, entry, latitude, longitude, timestamp, vesselId
    );
    return id;
}

export async function getLogs(db: SQLiteDatabase): Promise<DBLog[]> {
    return db.getAllAsync<DBLog>(`
        SELECT logs.*, vessels.name as vessel_name
        FROM logs
                 LEFT JOIN vessels ON logs.vessel_id = vessels.id
        ORDER BY timestamp DESC
    `);
}

export async function getLogById(db: SQLiteDatabase, id: string): Promise<DBLog | null> {
    return db.getFirstAsync<DBLog>(
        `SELECT logs.*, vessels.name as vessel_name
         FROM logs
                  LEFT JOIN vessels ON logs.vessel_id = vessels.id
         WHERE logs.id = ?`,
        id
    );
}

export const updateLog = async (
    db: any,
    id: string | number,
    entry: string,
    timestamp?: string,
    lat?: number,
    lon?: number
) => {
    if (timestamp !== undefined && lat !== undefined && lon !== undefined) {
        return await db.runAsync(
            'UPDATE logs SET entry = ?, timestamp = ?, latitude = ?, longitude = ? WHERE id = ?',
            [entry, timestamp, lat, lon, id]
        );
    } else {
        return await db.runAsync(
            'UPDATE logs SET entry = ? WHERE id = ?',
            [entry, id]
        );
    }
};

export async function deleteLog(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM logs WHERE id = ?`, id);
}

// --- VESSEL FUNCTIONS ---

export async function addVessel(
    db: SQLiteDatabase,
    name: string,
    type: string,
    registration: string
): Promise<string> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO vessels (id, name, type, registration, created_at) VALUES (?, ?, ?, ?, ?)`,
        id, name, type, registration, createdAt
    );
    return id;
}

export async function getVessels(db: SQLiteDatabase): Promise<DBVessel[]> {
    return db.getAllAsync<DBVessel>(`SELECT * FROM vessels ORDER BY created_at DESC`);
}

export async function deleteVessel(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM vessels WHERE id = ?`, id);
}