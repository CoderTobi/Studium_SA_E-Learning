// Stores files on the host file system and their metadata in the `files` table.
// Used by the Content Manager.

import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { StoredFile } from '../../../types';
import { DatabaseInstance } from '../database/DatabaseInstance';

const UPLOAD_DIR = 'uploads';

const FILE_SELECT = `
	SELECT id, original_name AS originalName, stored_path AS storedPath, mime_type AS mimeType,
	       size_bytes AS sizeBytes, uploaded_by AS uploadedBy, uploaded_at AS uploadedAt
	FROM files`;

export class ContentRepository {
	private get db() {
		return DatabaseInstance.getInstance();
	}

	/** Writes the file to disk under a generated name and saves its metadata. */
	save(data: Uint8Array, originalName: string, mimeType: string, uploadedBy: number): StoredFile {
		// Keep only a simple extension (e.g. ".pdf"). Never use the user's file name as the path.
		const extension = extname(originalName);
		const safeExtension = /^\.[a-z0-9]{1,10}$/i.test(extension) ? extension.toLowerCase() : '';
		const storedPath = join(UPLOAD_DIR, `${randomUUID()}${safeExtension}`);

		mkdirSync(UPLOAD_DIR, { recursive: true });
		writeFileSync(storedPath, data);

		try {
			const { lastInsertId } = this.db.run(
				`INSERT INTO files (original_name, stored_path, mime_type, size_bytes, uploaded_by)
				 VALUES (?, ?, ?, ?, ?)`,
				[originalName, storedPath, mimeType, data.byteLength, uploadedBy]
			);
			return this.findById(lastInsertId)!;
		} catch (error) {
			rmSync(storedPath, { force: true }); // don't leave an orphaned file on disk
			throw error;
		}
	}

	findById(id: number): StoredFile | undefined {
		return this.db.get<StoredFile>(`${FILE_SELECT} WHERE id = ?`, [id]);
	}

	/** Reads the file content from disk. */
	read(file: StoredFile): Buffer {
		return readFileSync(file.storedPath);
	}

	/**
	 * Deletes the file from disk and the DB. Materials that reference it are removed too
	 * (ON DELETE CASCADE). Exams and submissions keep their row with `file_id = NULL`.
	 */
	delete(id: number): boolean {
		const file = this.findById(id);
		if (!file) return false;

		this.db.run(`DELETE FROM files WHERE id = ?`, [id]);
		rmSync(file.storedPath, { force: true });
		return true;
	}
}
