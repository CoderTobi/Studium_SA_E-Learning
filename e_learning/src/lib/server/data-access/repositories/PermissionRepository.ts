// Stores user roles (column `users.role`, see DB_Schema.md).
// Used by the Users and Permissions Manager.

import type { Role } from '../../../types';
import { DatabaseInstance } from '../database/DatabaseInstance';

export class PermissionRepository {
	private get db() {
		return DatabaseInstance.getInstance();
	}

	getRole(userId: number): Role | undefined {
		return this.db.get<{ role: Role }>(`SELECT role FROM users WHERE id = ?`, [userId])?.role;
	}

	/** Returns `true` if the user exists and the role was set. */
	setRole(userId: number, role: Role): boolean {
		return this.db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, userId]).changes > 0;
	}

	countByRole(role: Role): number {
		return this.db.get<{ count: number }>(`SELECT COUNT(*) AS count FROM users WHERE role = ?`, [
			role
		])!.count;
	}
}
