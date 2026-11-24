// Stores user accounts in the `users` table.
// Used by the Users and Permissions Manager.

import type { User, UserWithPassword } from '../../../types';
import { DatabaseInstance } from '../database/DatabaseInstance';

const USER_COLUMNS = `id, username, role, created_at AS createdAt`;

export class UserRepository {
	private get db() {
		return DatabaseInstance.getInstance();
	}

	/** Creates a new user with the default role `student`. */
	create(username: string, passwordHash: string): User {
		const { lastInsertId } = this.db.run(
			`INSERT INTO users (username, password_hash) VALUES (?, ?)`,
			[username, passwordHash]
		);
		return this.findById(lastInsertId)!;
	}

	findById(id: number): User | undefined {
		return this.db.get<User>(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]);
	}

	/** Includes the password hash, for login only. */
	findByUsername(username: string): UserWithPassword | undefined {
		return this.db.get<UserWithPassword>(
			`SELECT ${USER_COLUMNS}, password_hash AS passwordHash FROM users WHERE username = ?`,
			[username]
		);
	}

	findAll(): User[] {
		return this.db.all<User>(`SELECT ${USER_COLUMNS} FROM users ORDER BY username`);
	}

	/** Returns `true` if a user was deleted. */
	delete(id: number): boolean {
		return this.db.run(`DELETE FROM users WHERE id = ?`, [id]).changes > 0;
	}
}
