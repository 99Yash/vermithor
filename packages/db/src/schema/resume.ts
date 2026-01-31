import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';
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

export const resumeParseObject = z.object({
  first_name: z
    .string()
    .nullable()
    .optional()
    .describe('First name of the user'),
  last_name: z.string().nullable().optional().describe('Last name of the user'),
  phone_number: z
    .string()
    .nullable()
    .optional()
    .describe('Contact number if present'),
  website_url: z
    .string()
    .optional()
    .nullable()
    .describe('Website of the user if present'),
  email: z.string().nullable().optional().describe('Email of the user'),
  location: z.string().nullable().optional().describe('Location of the user'),
  summary: z
    .string()
    .nullable()
    .optional()
    .describe('Summary section in the resume as string'),
  highlights: z
    .string()
    .optional()
    .nullable()
    .describe('Highlights or key achievements section in the resume as string'),
  skills: z
    .union([
      z
        .array(z.string().describe('A skill mentioned in the resume'))
        .describe('Flat array of skills extracted from the resume'),
      z
        .array(
          z.object({
            title: z
              .string()
              .nullable()
              .optional()
              .describe(
                'Title of the skill sub-category (e.g., Programming Languages, Frameworks)'
              ),
            skills: z
              .array(z.string().describe('A skill within this category'))
              .nullable()
              .optional()
              .describe('Array of skills under this category'),
          })
        )
        .describe(
          'Array of skill categories, each with an optional title and a list of skills'
        ),
    ])
    .nullable()
    .optional()
    .describe(
      'Skills section: either a flat list of skills (string[]) or a list of categories ({title?: string, skills: string[]}[]). Strictly should not be a mix of both.'
    ),
  education: z
    .array(
      z.object({
        school: z.string().nullable().optional().describe('Name of the school'),
        degreeName: z
          .string()
          .nullable()
          .optional()
          .describe('Name of the degree - MS, BS, etc.'),
        fieldOfStudy: z
          .string()
          .nullable()
          .optional()
          .describe('Field of study'),
        startsAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('Start month of the education'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('Start year of the education'),
          })
          .nullable()
          .optional(),
        endsAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('End month of the education'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('End year of the education'),
          })
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional()
    .describe('List of education background'),
  experiences: z
    .array(
      z.object({
        company: z.string().nullable().optional().describe('Company name'),
        positions: z
          .array(
            z.object({
              title: z
                .string()
                .nullable()
                .optional()
                .describe('Position title'),
              description: z
                .string()
                .nullable()
                .optional()
                .describe('Description of the position'),
              location: z
                .string()
                .nullable()
                .optional()
                .describe('Location of the position'),
              startsAt: z
                .object({
                  month: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('Start month of the position'),
                  year: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('Start year of the position'),
                })
                .nullable()
                .optional(),
              endsAt: z
                .object({
                  month: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('End month of the position'),
                  year: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('End year of the position'),
                })
                .nullable()
                .optional(),
            })
          )
          .optional(),
      })
    )
    .nullable()
    .optional()
    .describe('List of work experiences'),
  certifications: z
    .array(
      z.object({
        authority: z
          .string()
          .nullable()
          .optional()
          .describe('The issuer of the certification'),
        name: z
          .string()
          .nullable()
          .optional()
          .describe('Name of the certification'),
        url: z
          .string()
          .nullable()
          .optional()
          .describe('URL to the certification'),
        issuedAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('Issue month of the certification'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('Issue year of the certification'),
          })
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional()
    .describe('List of certifications'),
  projects: z
    .array(
      z.object({
        name: z.string().nullable().optional().describe('Name of the project'),
        description: z
          .string()
          .nullable()
          .optional()
          .describe('Description of the project'),
        startsAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('Start month of the project'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('Start year of the project'),
          })
          .nullable()
          .optional(),
        endsAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('End month of the project'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('End year of the project'),
          })
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional()
    .describe('List of projects'),
  awards: z
    .array(
      z.object({
        name: z.string().nullable().optional().describe('Name of the award'),
        description: z
          .string()
          .nullable()
          .optional()
          .describe('Description of the award'),
        issuer: z
          .string()
          .nullable()
          .optional()
          .describe('Issuer of the award, if present.'),
        issuedAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('Issue month of the award'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('Issue year of the award'),
          })
          .nullable()
          .optional(),
      })
    )
    .nullable()
    .optional()
    .describe('List of awards'),
  patents: z
    .array(
      z.object({
        name: z.string().nullable().optional().describe('Title of the patent'),
        description: z
          .string()
          .nullable()
          .optional()
          .describe('Description of the patent'),
        patentNumber: z
          .string()
          .nullable()
          .optional()
          .describe('Patent number'),
        url: z.string().nullable().optional().describe('URL to the patent'),
        issuedAt: z
          .object({
            month: z
              .number()
              .nullable()
              .optional()
              .describe('Issue month of the patent'),
            year: z
              .number()
              .nullable()
              .optional()
              .describe('Issue year of the patent'),
          })
          .nullable()
          .optional(),
      })
    )
    .optional()
    .nullable()
    .describe('List of patents'),
  languages: z
    .array(
      z.object({
        name: z.string().nullable().optional().describe('Name of the language'),
        proficiency: z
          .string()
          .nullable()
          .optional()
          .describe('Proficiency level of the language'),
      })
    )
    .optional()
    .nullable()
    .describe('List of languages spoken by the user'),
});

export type ResumeParseObject = z.infer<typeof resumeParseObject>;

export const resumeParsed = pgTable('resume_parsed', {
  id: text('id').primaryKey(),
  resumeFileId: text('resume_file_id')
    .notNull()
    .references(() => resumeFile.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rawText: text('raw_text'),
  data: jsonb('data').$type<ResumeParseObject>(),
  pageCount: integer('page_count'),
  status: text('status').notNull().$type<ResumeParsedStatus>(),
  errorMessage: text('error_message'),
  ...lifecycle_dates,
});
