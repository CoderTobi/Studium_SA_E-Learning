// ======== Singleton Pattern ========
// Creates the database connection exactly once. Repositories call
// DatabaseInstance.getInstance() instead of opening their own connection.

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { hashPassword } from '../../utils/password';
import type { DatabaseAdapter } from './DatabaseAdapter';
import { SQLiteAdapter } from './SQLiteAdapter';
import { SCHEMA } from './schema';

const DB_FILE = 'data/database.db';

// Initial admin, created once if no admin exists yet.
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export class DatabaseInstance {
	private static instance: DatabaseAdapter | null = null;

	// No `new DatabaseInstance()` from outside.
	private constructor() {}

	static getInstance(): DatabaseAdapter {
		if (DatabaseInstance.instance === null) {
			mkdirSync(dirname(DB_FILE), { recursive: true });

			// Swap this line to use a different database (e.g. a PostgreSQL adapter).
			const db: DatabaseAdapter = new SQLiteAdapter(DB_FILE);

			db.exec(SCHEMA);
			DatabaseInstance.seedAdmin(db);
			DatabaseInstance.instance = db;
		}
		return DatabaseInstance.instance;
	}

	private static seedAdmin(db: DatabaseAdapter): void {
		const admin = db.get(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
		if (admin) return;

		db.run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')`, [
			DEFAULT_ADMIN_USERNAME,
			hashPassword(DEFAULT_ADMIN_PASSWORD)
		]);
	}
}
