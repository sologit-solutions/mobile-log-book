import { type SQLiteDatabase } from "expo-sqlite";

export class MigrationService {
    static async migrateDbIfNeeded(db: SQLiteDatabase) {
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
}