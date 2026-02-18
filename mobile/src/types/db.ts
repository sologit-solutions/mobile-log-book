/**
 * src/types/db.ts
 *
 * This file contains the strict TypeScript interfaces that mirror
 * the Backend Prisma Models.
 */

export interface DBLogItem {
	id: string;
	logbook_id: string;
	title: string;
	body?: string | null;

	latitude: number;
	longitude: number;

	crew?: number | null;
	speed?: number | null;

	created_at: string; // ISO 8601 string
	updated_at: string; // ISO 8601 string
	vessel_id?: string | null;

	version: number;
}

export interface DBLogbook {
	id: string;
	name: string;
	owner_id?: string;

	type?: string | null;
	registration?: string | null;

	created_at: string;
	updated_at: string;
	version: number;
}
