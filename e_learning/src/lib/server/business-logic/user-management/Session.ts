// Sessions of logged-in users. Kept in memory only, so a server restart logs everyone out.
// Used by the Kurs-Manager and Prüfungs-Manager to check who the user is and which role they have.

import { randomBytes } from 'node:crypto';
import type { Role } from '../../../types';
import { PermissionError } from '../errors';

export const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface Session {
	id: string;
	userId: number;
	username: string;
	role: Role;
	expiresAt: number;
}

const sessions = new Map<string, Session>();

export function createSession(userId: number, username: string, role: Role): Session {
	const session: Session = {
		id: randomBytes(32).toString('hex'),
		userId,
		username,
		role,
		expiresAt: Date.now() + SESSION_LIFETIME_MS
	};
	sessions.set(session.id, session);
	return session;
}

/** Returns the session, or `undefined` if it doesn't exist or has expired. */
export function getSession(id: string): Session | undefined {
	const session = sessions.get(id);
	if (session && session.expiresAt < Date.now()) {
		sessions.delete(id);
		return undefined;
	}
	return session;
}

export function deleteSession(id: string): void {
	sessions.delete(id);
}

/** Changes the role in all active sessions of a user, so it applies without logging in again. */
export function updateSessionRole(userId: number, role: Role): void {
	for (const session of sessions.values()) {
		if (session.userId === userId) session.role = role;
	}
}

export function deleteSessionsOfUser(userId: number): void {
	for (const [id, session] of sessions) {
		if (session.userId === userId) sessions.delete(id);
	}
}

/**
 * Makes sure a user is logged in and (optionally) has one of the given roles.
 * Without roles, any logged-in user passes.
 */
export function requireRole(session: Session | undefined, ...roles: Role[]): Session {
	if (!session) throw new PermissionError('Not logged in');
	if (roles.length > 0 && !roles.includes(session.role)) {
		throw new PermissionError('Not allowed');
	}
	return session;
}
