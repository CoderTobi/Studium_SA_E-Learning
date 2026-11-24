// Manages exams and their submissions and grades (tables `exams`, `submissions`).
// Used by the Prüfungs-Manager.

import type { Exam, Submission } from '../../../types';
import { DatabaseInstance } from '../database/DatabaseInstance';

const EXAM_SELECT = `
	SELECT id, course_id AS courseId, title, description, file_id AS fileId, created_at AS createdAt
	FROM exams`;

const SUBMISSION_SELECT = `
	SELECT s.id, s.exam_id AS examId, s.student_id AS studentId, u.username AS studentName,
	       s.answer_text AS answerText, s.file_id AS fileId, s.submitted_at AS submittedAt,
	       s.grade, s.feedback, s.graded_at AS gradedAt
	FROM submissions s
	JOIN users u ON u.id = s.student_id`;

export class ExamRepository {
	private get db() {
		return DatabaseInstance.getInstance();
	}

	// ---------- Exams ----------

	create(courseId: number, title: string, description: string | null, fileId: number | null): Exam {
		const { lastInsertId } = this.db.run(
			`INSERT INTO exams (course_id, title, description, file_id) VALUES (?, ?, ?, ?)`,
			[courseId, title, description, fileId]
		);
		return this.findById(lastInsertId)!;
	}

	findById(id: number): Exam | undefined {
		return this.db.get<Exam>(`${EXAM_SELECT} WHERE id = ?`, [id]);
	}

	findByCourse(courseId: number): Exam[] {
		return this.db.all<Exam>(`${EXAM_SELECT} WHERE course_id = ? ORDER BY created_at`, [courseId]);
	}

	/** Also removes all submissions of the exam (ON DELETE CASCADE). */
	delete(id: number): boolean {
		return this.db.run(`DELETE FROM exams WHERE id = ?`, [id]).changes > 0;
	}

	// ---------- Submissions ----------

	/** Fails with a UNIQUE constraint error if the student already submitted. */
	createSubmission(
		examId: number,
		studentId: number,
		answerText: string | null,
		fileId: number | null
	): Submission {
		const { lastInsertId } = this.db.run(
			`INSERT INTO submissions (exam_id, student_id, answer_text, file_id) VALUES (?, ?, ?, ?)`,
			[examId, studentId, answerText, fileId]
		);
		return this.findSubmissionById(lastInsertId)!;
	}

	findSubmissionById(id: number): Submission | undefined {
		return this.db.get<Submission>(`${SUBMISSION_SELECT} WHERE s.id = ?`, [id]);
	}

	/** A student's own submission (and result) for an exam. */
	findSubmission(examId: number, studentId: number): Submission | undefined {
		return this.db.get<Submission>(
			`${SUBMISSION_SELECT} WHERE s.exam_id = ? AND s.student_id = ?`,
			[examId, studentId]
		);
	}

	/** All submissions of an exam, for the teacher. */
	findSubmissionsByExam(examId: number): Submission[] {
		return this.db.all<Submission>(`${SUBMISSION_SELECT} WHERE s.exam_id = ? ORDER BY u.username`, [
			examId
		]);
	}

	/** Sets the grade (1.0 to 5.0) and feedback. Returns `false` if the submission doesn't exist. */
	grade(submissionId: number, grade: number, feedback: string | null): boolean {
		return (
			this.db.run(
				`UPDATE submissions SET grade = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?`,
				[grade, feedback, submissionId]
			).changes > 0
		);
	}
}
