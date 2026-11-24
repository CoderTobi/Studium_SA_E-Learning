// Errors thrown by the Business Logic Layer.
// The Presentation Layer turns them into HTTP responses (401/403 or 400).

/** The user is not logged in or lacks the required role. */
export class PermissionError extends Error {}

/** The input is invalid (e.g. username already taken). */
export class ValidationError extends Error {}
