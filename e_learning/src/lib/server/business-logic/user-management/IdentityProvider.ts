// Identifies users: checks username and password against the data of the
// Users and Permissions Manager and creates a session for them.
// A deliberately simple implementation, not a real identity provider.

import { verifyPassword } from '../../utils/password';
import { createSession, deleteSession, getSession, type Session } from './Session';
import { UsersAndPermissionsManager } from './UsersAndPermissionsManager';

export class IdentityProvider {
	private readonly usersAndPermissions = new UsersAndPermissionsManager();

	/** Returns a new session, or `undefined` if username or password is wrong. */
	login(username: string, password: string): Session | undefined {
		const user = this.usersAndPermissions.getCredentials(username);
		if (!user || !verifyPassword(password, user.passwordHash)) return undefined;

		// The role comes from the Users and Permissions Manager.
		const role = this.usersAndPermissions.getRole(user.id)!;
		return createSession(user.id, user.username, role);
	}

	logout(sessionId: string): void {
		deleteSession(sessionId);
	}

	/** Finds the session for a session ID (e.g. from a cookie). */
	identify(sessionId: string | undefined): Session | undefined {
		return sessionId ? getSession(sessionId) : undefined;
	}
}
