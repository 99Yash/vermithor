import { and, eq } from 'drizzle-orm';
import { PDFParse } from 'pdf-parse';
import { db } from '@vermithor/db';
import { createId } from '@vermithor/db/helpers';
import {
  resumeFile,
  resumeParsed,
  type ResumeParsedStatus,
} from '@vermithor/db/schema/resume';
import { readResumeFile } from '../s3';
import { parseResumeToStructuredData } from './parse-resume';

export type ResumeParseJob = {
  resumeId: string;
  userId: string;
};

const RESUME_FILE_READ_TIMEOUT_MS = 15_000;
const RESUME_PARSE_TIMEOUT_MS = 30_000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}


export async function processResumeParseJob({
  resumeId,
  userId,
}: ResumeParseJob) {
  const [record] = await db
    .select()
    .from(resumeFile)
    .where(and(eq(resumeFile.id, resumeId), eq(resumeFile.userId, userId)))
    .limit(1);

  if (!record) {
    throw new Error('Resume not found.');
  }

  if (record.status !== 'uploaded') {
    throw new Error('Resume must be uploaded before parsing.');
  }

  const [existingParsed] = await db
    .select()
    .from(resumeParsed)
    .where(eq(resumeParsed.resumeFileId, resumeId))
    .limit(1);

  if (existingParsed?.status === 'completed' && existingParsed.data) {
    return {
      parsedId: existingParsed.id,
      status: existingParsed.status,
    };
  }

  const parsedId = existingParsed?.id ?? createId('parsed');

  if (existingParsed) {
    await db
      .update(resumeParsed)
      .set({ status: 'parsing', errorMessage: null })
      .where(eq(resumeParsed.id, parsedId));
  } else {
    await db.insert(resumeParsed).values({
      id: parsedId,
      resumeFileId: resumeId,
      userId,
      status: 'parsing',
    });
  }

  try {
    const pdfBuffer = await withTimeout(
      readResumeFile({ key: record.s3Key }),
      RESUME_FILE_READ_TIMEOUT_MS,
      'Timed out reading resume from storage.',
    );
    const parser = new PDFParse({ data: pdfBuffer });

    try {
      const textResult = await withTimeout(
        parser.getText(),
        RESUME_PARSE_TIMEOUT_MS,
        'Timed out parsing resume.',
      );
      const rawText = textResult.text;
      const pageCount = textResult.total;

      await db
        .update(resumeParsed)
        .set({ rawText, pageCount })
        .where(eq(resumeParsed.id, parsedId));

      const data = parseResumeToStructuredData(rawText);
      const completedStatus: ResumeParsedStatus = 'completed';

      await db
        .update(resumeParsed)
        .set({
          status: completedStatus,
          data,
          errorMessage: null,
        })
        .where(eq(resumeParsed.id, parsedId));

      return {
        parsedId,
        status: completedStatus,
        data,
        pageCount,
      };
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown parsing error';

    await db
      .update(resumeParsed)
      .set({ status: 'failed', errorMessage })
      .where(eq(resumeParsed.id, parsedId));

    throw error;
  }
}
