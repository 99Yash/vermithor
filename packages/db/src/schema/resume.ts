import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { lifecycle_dates } from '../helpers';
import { user } from './auth';

export type ResumeFileStatus = 'pending' | 'uploaded' | 'rejected';

export const resumeFile = pgTable('resume_file', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  bucket: text('bucket').notNull(),
  s3Key: text('s3_key').notNull(),
  originalFileName: text('original_file_name').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  status: text('status').notNull().$type<ResumeFileStatus>(),
  ...lifecycle_dates,
});

export type ResumeParsedStatus = 'pending' | 'parsing' | 'completed' | 'failed';

export const resumeParsed = pgTable('resume_parsed', {
  id: text('id').primaryKey(),
  resumeFileId: text('resume_file_id')
    .notNull()
    .references(() => resumeFile.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rawText: text('raw_text'),
  pageCount: integer('page_count'),
  status: text('status').notNull().$type<ResumeParsedStatus>(),
  errorMessage: text('error_message'),
  ...lifecycle_dates,
});
