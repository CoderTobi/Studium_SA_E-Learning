// Manages courses, enrollments and course materials
// (tables `courses`, `enrollments`, `materials`).
// Used by the Kurs-Manager.

import type { Course, Enrollment, Material } from '../../../types';
import { DatabaseInstance } from '../database/DatabaseInstance';

const COURSE_SELECT = `
	SELECT c.id, c.title, c.description, c.teacher_id AS teacherId,
	       u.username AS teacherName, c.created_at AS createdAt
	FROM courses c
	JOIN users u ON u.id = c.teacher_id`;

const MATERIAL_SELECT = `
	SELECT m.id, m.course_id AS courseId, m.file_id AS fileId, m.title,
	       f.original_name AS originalName, f.mime_type AS mimeType, f.uploaded_at AS uploadedAt
	FROM materials m
	JOIN files f ON f.id = m.file_id`;

export class CourseRepository {
	private get db() {
		return DatabaseInstance.getInstance();
	}

	// ---------- Courses ----------

	create(title: string, description: string | null, teacherId: number): Course {
		const { lastInsertId } = this.db.run(
			`INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)`,
			[title, description, teacherId]
		);
		return this.findById(lastInsertId)!;
	}

	findById(id: number): Course | undefined {
		return this.db.get<Course>(`${COURSE_SELECT} WHERE c.id = ?`, [id]);
	}

	findAll(): Course[] {
		return this.db.all<Course>(`${COURSE_SELECT} ORDER BY c.title`);
	}

	findByTeacher(teacherId: number): Course[] {
		return this.db.all<Course>(`${COURSE_SELECT} WHERE c.teacher_id = ? ORDER BY c.title`, [
			teacherId
		]);
	}

	/** Courses a student is enrolled in. */
	findByStudent(userId: number): Course[] {
		return this.db.all<Course>(
			`${COURSE_SELECT}
			 JOIN enrollments e ON e.course_id = c.id
			 WHERE e.user_id = ?
			 ORDER BY c.title`,
			[userId]
		);
	}

	/**
	 * Also removes the course's enrollments, materials and exams (ON DELETE CASCADE).
	 * The files on disk are not removed. The Kurs-Manager deletes them through the Content Manager.
	 */
	delete(id: number): boolean {
		return this.db.run(`DELETE FROM courses WHERE id = ?`, [id]).changes > 0;
	}

	// ---------- Enrollments ----------

	/** Returns `false` if the user was already enrolled. */
	enroll(userId: number, courseId: number): boolean {
		return (
			this.db.run(`INSERT OR IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)`, [
				userId,
				courseId
			]).changes > 0
		);
	}

	unenroll(userId: number, courseId: number): boolean {
		return (
			this.db.run(`DELETE FROM enrollments WHERE user_id = ? AND course_id = ?`, [userId, courseId])
				.changes > 0
		);
	}

	isEnrolled(userId: number, courseId: number): boolean {
		return (
			this.db.get(`SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?`, [
				userId,
				courseId
			]) !== undefined
		);
	}

	findEnrollments(courseId: number): Enrollment[] {
		return this.db.all<Enrollment>(
			`SELECT e.user_id AS userId, u.username, e.enrolled_at AS enrolledAt
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_id = ?
			 ORDER BY u.username`,
			[courseId]
		);
	}

	// ---------- Materials ----------

	/** Links a file that was already saved by the ContentRepository to a course. */
	addMaterial(courseId: number, fileId: number, title: string): Material {
		const { lastInsertId } = this.db.run(
			`INSERT INTO materials (course_id, file_id, title) VALUES (?, ?, ?)`,
			[courseId, fileId, title]
		);
		return this.findMaterialById(lastInsertId)!;
	}

	findMaterialById(id: number): Material | undefined {
		return this.db.get<Material>(`${MATERIAL_SELECT} WHERE m.id = ?`, [id]);
	}

	findMaterials(courseId: number): Material[] {
		return this.db.all<Material>(`${MATERIAL_SELECT} WHERE m.course_id = ? ORDER BY m.title`, [
			courseId
		]);
	}

	// There is no deleteMaterial() on purpose. Deleting the file through the
	// ContentRepository also removes the material row (ON DELETE CASCADE).
}
