import "react-native-get-random-values";
import { type SQLiteDatabase } from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import { DBLogItem } from "@/src/types/db";

export class LogItemRepository {
    static async addLogItem(db: SQLiteDatabase, logbookId: string, title: string, body: string | null, latitude: number, longitude: number): Promise<string> {
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
            now,
            now,
            0,
        );
        return id;
    }

    static async getLogItems(db: SQLiteDatabase, logbookId?: string): Promise<DBLogItem[]> {
        if (logbookId) {
            return db.getAllAsync<DBLogItem>(`SELECT * FROM log_items WHERE logbook_id = ? ORDER BY created_at DESC`, logbookId);
        }
        return db.getAllAsync<DBLogItem>(`SELECT * FROM log_items ORDER BY created_at DESC`);
    }

    static async getLogItemById(db: SQLiteDatabase, id: string): Promise<DBLogItem | null> {
        return db.getFirstAsync<DBLogItem>(`SELECT * FROM log_items WHERE id = ?`, id);
    }

    static async updateLogItem(db: SQLiteDatabase, id: string, title: string, body: string | null, lat?: number, lon?: number) {
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
    }

    static async deleteLogItem(db: SQLiteDatabase, id: string): Promise<void> {
        await db.runAsync(`DELETE FROM log_items WHERE id = ?`, id);
    }

    static async getPendingLogItems(db: SQLiteDatabase, logbookId: string) {
        return db.getAllAsync<DBLogItem>(
            `SELECT * FROM log_items WHERE logbook_id = ? AND version = 0`,
            logbookId
        );
    }

    static async getHighestLogItemVersion(db: SQLiteDatabase, logbookId: string): Promise<number> {
        const result = await db.getFirstAsync<{ max_version: number }>(
            `SELECT MAX(version) as max_version FROM log_items WHERE logbook_id = ?`,
            logbookId
        );
        return result?.max_version || 0;
    }

    static async mergeRemoteLogItems(db: SQLiteDatabase, logbookId: string, remoteItems: any[]): Promise<void> {
        await db.withTransactionAsync(async () => {
            for (const item of remoteItems) {
                if (item.isActive === false) {
                    await db.runAsync(`DELETE FROM log_items WHERE id = ?`, item.id);
                } else {
                    await db.runAsync(
                        `INSERT INTO log_items (id, logbook_id, title, body, latitude, longitude, created_at, updated_at, version)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT(id) DO UPDATE SET
                         title = excluded.title,
                         body = excluded.body,
                         latitude = excluded.latitude,
                         longitude = excluded.longitude,
                         updated_at = excluded.updated_at,
                         version = excluded.version`,
                        item.id,
                        logbookId,
                        item.title,
                        item.body || null,
                        item.latitude,
                        item.longitude,
                        item.createdAt,
                        item.updatedAt,
                        item.version
                    );
                }
            }
        });
    }
}