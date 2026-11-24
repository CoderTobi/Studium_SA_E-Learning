// ======== Adapter Pattern: Target ========
// Interface the repositories work against. It only knows SQL, not which
// database library is used underneath. Every DB library gets its own adapter.

export type SqlValue = string | number | bigint | null;

/** Positional (`?`) or named (`@name`) query parameters. */
export type SqlParams = SqlValue[] | Record<string, SqlValue>;

export interface RunResult {
	/** Number of rows changed by INSERT / UPDATE / DELETE. */
	changes: number;
	/** ID of the last inserted row. */
	lastInsertId: number;
}

export interface DatabaseAdapter {
	/** Runs a SELECT and returns all rows. */
	all<T>(sql: string, params?: SqlParams): T[];

	/** Runs a SELECT and returns the first row, or `undefined`. */
	get<T>(sql: string, params?: SqlParams): T | undefined;

	/** Runs an INSERT / UPDATE / DELETE. */
	run(sql: string, params?: SqlParams): RunResult;

	/** Runs one or more statements without parameters (e.g. the schema). */
	exec(sql: string): void;
}
