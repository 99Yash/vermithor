import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { lifecycle_dates } from '../helpers';
import { user } from './auth';

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
  status: text('status').notNull(),
  ...lifecycle_dates,
});
