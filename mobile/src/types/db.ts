/**
 * src/types/db.ts
 *
 * This file contains the strict TypeScript interfaces that mirror
 * the SQLite database schema.
 */

export interface DBLog {
    id: string;
    entry: string;
    latitude: number;
    longitude: number;
    timestamp: string;      // ISO 8601 string
    updated_at: string;     // ISO 8601 string
    vessel_id?: string | null;
    // Joins
    vessel_name?: string | null;
}

export interface DBVessel {
    id: string;
    name: string;
    type: string;
    registration?: string | null;
    created_at: string;     // ISO 8601 string
}