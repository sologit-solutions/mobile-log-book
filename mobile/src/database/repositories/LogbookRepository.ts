import "react-native-get-random-values";
import { type SQLiteDatabase } from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import { DBLogbook } from "@/src/types/db";

export class LogbookRepository {
    static async addLogbook(db: SQLiteDatabase, ownerId: string, name: string, type: string, registration: string): Promise<string> {
        const id = uuidv4();
        const now = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO logbooks (id, owner_id, name, type, registration, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            id,
            ownerId,
            name,
            type,
            registration,
            now,
            now,
            0,
        );
        return id;
    }

    static async getLogbooks(db: SQLiteDatabase, ownerId: string): Promise<DBLogbook[]> {
        return db.getAllAsync<DBLogbook>(`SELECT * FROM logbooks WHERE owner_id = ? ORDER BY created_at DESC`, ownerId);
    }

    static async deleteLogbook(db: SQLiteDatabase, id: string): Promise<void> {
        await db.runAsync(`DELETE FROM logbooks WHERE id = ?`, id);
    }

    static async syncLogbooks(db: SQLiteDatabase, remoteLogbooks: any[], ownerId: string): Promise<void> {
        for (const lb of remoteLogbooks) {
            const name = lb.name || "Unnamed Vessel";
            const type = lb.vesselType || "";
            const registration = lb.registration || "";
            const createdAt = lb.createdAt || new Date().toISOString();
            const updatedAt = lb.updatedAt || new Date().toISOString();
            const version = lb.version || 0;

            await db.runAsync(
                `INSERT OR IGNORE INTO logbooks (id, owner_id, name, type, registration, created_at, updated_at, version)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                lb.id,
                ownerId,
                name,
                type,
                registration,
                createdAt,
                updatedAt,
                version,
            );
        }
    }

    static async assignLocalDataToUser(db: SQLiteDatabase, userId: string): Promise<number> {
        const result = await db.runAsync(
            `UPDATE logbooks SET owner_id = ? WHERE owner_id = 'local' OR owner_id IS NULL`,
            userId
        );
        return result.changes;
    }
}