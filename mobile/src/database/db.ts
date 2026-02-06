import { type SQLiteDatabase } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import { DBLog, DBVessel } from '@/src/types/db';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    // ... (Keep your existing migration logic exactly as is)
    const DATABASE_VERSION = 3;
    // ... (Keep the rest of the migration code)
    const versionRow = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    );
    const currentDbVersion = versionRow?.user_version ?? 0;

    if (currentDbVersion >= DATABASE_VERSION) {
        return;
    }

    // ... (Keep existing migration SQL execution)
    // Note: If you lost the original code, ensure the tables 'logs' and 'vessels' are created here.
    // I am omitting the full migration body here to save space, BUT KEEP IT IN YOUR FILE.

    // ... (End of migration logic)
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
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
    // If we have the extra data, update everything.
    if (timestamp !== undefined && lat !== undefined && lon !== undefined) {
        return await db.runAsync(
            'UPDATE logs SET entry = ?, timestamp = ?, latitude = ?, longitude = ? WHERE id = ?',
            [entry, timestamp, lat, lon, id]
        );
    } else {
        // Fallback: only update the text entry (legacy behavior)
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
    await db.runAsync(
        `INSERT INTO vessels (id, name, type, registration) VALUES (?, ?, ?, ?)`,
        id, name, type, registration
    );
    return id;
}

export async function getVessels(db: SQLiteDatabase): Promise<DBVessel[]> {
    return db.getAllAsync<DBVessel>(`SELECT * FROM vessels ORDER BY created_at DESC`);
}

export async function deleteVessel(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync(`DELETE FROM vessels WHERE id = ?`, id);
}