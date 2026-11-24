// Entities shared by all layers (returned by the repositories).

export const ROLES = ['student', 'teacher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export interface User {
	id: number;
	username: string;
	role: Role;
	createdAt: string;
}

/** Only used for login. Never send this to the browser. */
export interface UserWithPassword extends User {
	passwordHash: string;
}

export interface Course {
	id: number;
	title: string;
	description: string | null;
	teacherId: number;
	teacherName: string;
	createdAt: string;
}

export interface Enrollment {
	userId: number;
	username: string;
	enrolledAt: string;
}

export interface StoredFile {
	id: number;
	originalName: string;
	storedPath: string;
	mimeType: string;
	sizeBytes: number;
	uploadedBy: number | null;
	uploadedAt: string;
}

export interface Material {
	id: number;
	courseId: number;
	fileId: number;
	title: string;
	originalName: string;
	mimeType: string;
	uploadedAt: string;
}

export interface Exam {
	id: number;
	courseId: number;
	title: string;
	description: string | null;
	fileId: number | null;
	createdAt: string;
}

export interface Submission {
	id: number;
	examId: number;
	studentId: number;
	studentName: string;
	answerText: string | null;
	fileId: number | null;
	submittedAt: string;
	grade: number | null;
	feedback: string | null;
	gradedAt: string | null;
}
