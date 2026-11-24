// Database schema as defined in DB_Schema.md (repository root).
// `IF NOT EXISTS` makes it safe to run on every start.

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	username      TEXT    NOT NULL UNIQUE,
	password_hash TEXT    NOT NULL,
	role          TEXT    NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
	created_at    TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	title       TEXT    NOT NULL,
	description TEXT,
	teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
	user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
	enrolled_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS files (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	original_name TEXT    NOT NULL,
	stored_path   TEXT    NOT NULL UNIQUE,
	mime_type     TEXT    NOT NULL,
	size_bytes    INTEGER NOT NULL,
	uploaded_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
	uploaded_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
	id        INTEGER PRIMARY KEY AUTOINCREMENT,
	course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
	file_id   INTEGER NOT NULL UNIQUE REFERENCES files(id) ON DELETE CASCADE,
	title     TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
	title       TEXT    NOT NULL,
	description TEXT,
	file_id     INTEGER REFERENCES files(id) ON DELETE SET NULL,
	created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	exam_id      INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
	student_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	answer_text  TEXT,
	file_id      INTEGER REFERENCES files(id) ON DELETE SET NULL,
	submitted_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
	grade        REAL    CHECK (grade BETWEEN 1.0 AND 5.0),
	feedback     TEXT,
	graded_at    TEXT,
	UNIQUE (exam_id, student_id)
);
`;
