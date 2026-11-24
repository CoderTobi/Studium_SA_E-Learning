// Manages users and their roles: registration, admin user management and role changes.
// Provides the role for new sessions and keeps active sessions in sync when roles change.

import { PermissionRepository } from '../../data-access/repositories/PermissionRepository';
import { UserRepository } from '../../data-access/repositories/UserRepository';
import { ROLES, type Role, type User, type UserWithPassword } from '../../../types';
import { hashPassword } from '../../utils/password';
import { PermissionError, ValidationError } from '../errors';
import { deleteSessionsOfUser, requireRole, updateSessionRole, type Session } from './Session';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 6;

export class UsersAndPermissionsManager {
	private readonly users = new UserRepository();
	private readonly permissions = new PermissionRepository();

	// ---------- Public ----------

	/** Self-registration. New users always get the role `student`. */
	register(username: string, password: string): User {
		username = username.trim();
		if (!USERNAME_PATTERN.test(username)) {
			throw new ValidationError(
				'Username must be 3 to 32 characters (letters, numbers, ".", "_", "-")'
			);
		}
		if (password.length < MIN_PASSWORD_LENGTH) {
			throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
		}
		if (this.users.findByUsername(username)) {
			throw new ValidationError('Username is already taken');
		}
		return this.users.create(username, hashPassword(password));
	}

	// ---------- Used by the Identity Provider ----------

	/** User including the password hash, for checking a login. */
	getCredentials(username: string): UserWithPassword | undefined {
		return this.users.findByUsername(username.trim());
	}

	/** Role that is added to a new session. */
	getRole(userId: number): Role | undefined {
		return this.permissions.getRole(userId);
	}

	// ---------- Admin only ----------

	listUsers(session: Session | undefined): User[] {
		requireRole(session, 'admin');
		return this.users.findAll();
	}

	/** Admins can add users with any role. */
	createUser(session: Session | undefined, username: string, password: string, role: Role): User {
		requireRole(session, 'admin');
		this.assertValidRole(role);
		const user = this.register(username, password);
		if (role !== 'student') this.permissions.setRole(user.id, role);
		return this.users.findById(user.id)!;
	}

	setRole(session: Session | undefined, userId: number, role: Role): void {
		const admin = requireRole(session, 'admin');
		this.assertValidRole(role);
		// Admins can't demote themselves, so there is always at least one admin.
		if (userId === admin.userId) throw new PermissionError('You cannot change your own role');
		if (!this.permissions.setRole(userId, role)) throw new ValidationError('User not found');
		updateSessionRole(userId, role);
	}

	deleteUser(session: Session | undefined, userId: number): void {
		const admin = requireRole(session, 'admin');
		if (userId === admin.userId) throw new PermissionError('You cannot delete yourself');
		if (!this.users.delete(userId)) throw new ValidationError('User not found');
		deleteSessionsOfUser(userId);
	}

	private assertValidRole(role: string): asserts role is Role {
		if (!ROLES.includes(role as Role)) throw new ValidationError('Invalid role');
	}
}
