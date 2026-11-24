// ======== Adapter Pattern: Adapter ========
// Translates the DatabaseAdapter interface (Target) to the better-sqlite3
// library (Adaptee).

import Database from 'better-sqlite3';
import type { DatabaseAdapter, RunResult, SqlParams } from './DatabaseAdapter';

export class SQLiteAdapter implements DatabaseAdapter {
	private readonly db: Database.Database;

	constructor(filePath: string) {
		this.db = new Database(filePath);
		this.db.pragma('foreign_keys = ON');
	}

	all<T>(sql: string, params?: SqlParams): T[] {
		const statement = this.db.prepare(sql);
		return (params === undefined ? statement.all() : statement.all(params)) as T[];
	}

	get<T>(sql: string, params?: SqlParams): T | undefined {
		const statement = this.db.prepare(sql);
		return (params === undefined ? statement.get() : statement.get(params)) as T | undefined;
	}

	run(sql: string, params?: SqlParams): RunResult {
		const statement = this.db.prepare(sql);
		const result = params === undefined ? statement.run() : statement.run(params);
		return { changes: result.changes, lastInsertId: Number(result.lastInsertRowid) };
	}

	exec(sql: string): void {
		this.db.exec(sql);
	}
}
