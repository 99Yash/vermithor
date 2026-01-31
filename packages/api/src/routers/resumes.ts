import { TRPCError } from '@trpc/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@vermithor/db';
import { createId } from '@vermithor/db/helpers';
import { resumeFile, resumeParsed } from '@vermithor/db/schema/resume';
import { z } from 'zod';
import { getS3Env } from '../env';
import { protectedProcedure, router } from '../index';
import { enqueueResumeParse } from '../queues/resume-parse';
import { assertRateLimit } from '../rate-limit';
import {
  buildResumeKey,
  createResumeUploadPost,
  deleteResumeObject,
  getResumeDownloadUrl,
  headResumeObject,
  readResumeHeader,
} from '../s3';

const PDF_CONTENT_TYPE = 'application/pdf';
const PDF_MAGIC_HEADER = '%PDF-';
const RESUME_LIST_DEFAULT_LIMIT = 50;
const RESUME_LIST_MAX_LIMIT = 100;
const RESUME_UPLOAD_RATE_LIMIT = { limit: 10, windowSeconds: 60 };
const RESUME_CONFIRM_RATE_LIMIT = { limit: 10, windowSeconds: 60 };
const RESUME_PARSE_RATE_LIMIT = { limit: 5, windowSeconds: 60 };

const resumeRateLimitKey = (action: string, userId: string) =>
  `resume:${action}:${userId}`;

function assertPdfHeader(buffer: Buffer) {
  return buffer.toString('utf8').startsWith(PDF_MAGIC_HEADER);
}

export const resumesRouter = router({
  createUpload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        contentType: z.string().min(1),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const env = getS3Env();

      if (input.contentType !== PDF_CONTENT_TYPE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only PDF uploads are supported.',
        });
      }

      if (input.sizeBytes > env.AWS_S3_MAX_UPLOAD_BYTES) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File exceeds the maximum allowed size.',
        });
      }

      const userId = ctx.session.user.id;
      await assertRateLimit({
        key: resumeRateLimitKey('create', userId),
        limit: RESUME_UPLOAD_RATE_LIMIT.limit,
        windowSeconds: RESUME_UPLOAD_RATE_LIMIT.windowSeconds,
      });
      const resumeId = createId('resume');
      const s3Key = buildResumeKey({ userId, resumeId });

      await db.insert(resumeFile).values({
        id: resumeId,
        userId,
        bucket: env.AWS_S3_BUCKET_NAME,
        s3Key,
        originalFileName: input.fileName,
        contentType: PDF_CONTENT_TYPE,
        sizeBytes: input.sizeBytes,
        status: 'pending',
      });

      const presignedPost = await createResumeUploadPost({
        key: s3Key,
        contentType: PDF_CONTENT_TYPE,
      });

      return {
        resumeId,
        uploadUrl: presignedPost.url,
        fields: presignedPost.fields,
        maxUploadBytes: env.AWS_S3_MAX_UPLOAD_BYTES,
        expiresInSeconds: env.AWS_S3_PRESIGN_EXPIRES_SECONDS,
      };
    }),

  confirmUpload: protectedProcedure
    .input(z.object({ resumeId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      await assertRateLimit({
        key: resumeRateLimitKey('confirm', userId),
        limit: RESUME_CONFIRM_RATE_LIMIT.limit,
        windowSeconds: RESUME_CONFIRM_RATE_LIMIT.windowSeconds,
      });
      const env = getS3Env();
      const [record] = await db
        .select()
        .from(resumeFile)
        .where(
          and(eq(resumeFile.id, input.resumeId), eq(resumeFile.userId, userId)),
        )
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found.',
        });
      }

      if (record.status === 'uploaded') {
        return { resumeId: record.id, status: record.status };
      }

      const rejectUpload = async (message: string) => {
        await deleteResumeObject({ key: record.s3Key });
        await db
          .update(resumeFile)
          .set({ status: 'rejected' })
          .where(eq(resumeFile.id, record.id));
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message,
        });
      };

      let head;
      try {
        head = await headResumeObject({ key: record.s3Key });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to read uploaded file metadata.',
          cause: error,
        });
      }
      const contentLength = head.ContentLength ?? 0;
      const contentType = head.ContentType ?? '';

      if (contentType !== PDF_CONTENT_TYPE) {
        await rejectUpload('Uploaded file is not a PDF.');
      }

      if (contentLength <= 0 || contentLength > env.AWS_S3_MAX_UPLOAD_BYTES) {
        await rejectUpload('Uploaded file failed size validation.');
      }

      let header;
      try {
        header = await readResumeHeader({ key: record.s3Key });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate uploaded file content.',
          cause: error,
        });
      }
      if (!assertPdfHeader(header)) {
        await rejectUpload('Uploaded file failed PDF validation.');
      }

      await db
        .update(resumeFile)
        .set({
          status: 'uploaded',
          sizeBytes: contentLength || record.sizeBytes,
          contentType,
        })
        .where(eq(resumeFile.id, record.id));

      return { resumeId: record.id, status: 'uploaded' };
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(RESUME_LIST_MAX_LIMIT).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const limit = input?.limit ?? RESUME_LIST_DEFAULT_LIMIT;
    const items = await db
      .select({
        id: resumeFile.id,
        originalFileName: resumeFile.originalFileName,
        contentType: resumeFile.contentType,
        sizeBytes: resumeFile.sizeBytes,
        status: resumeFile.status,
        createdAt: resumeFile.createdAt,
        updatedAt: resumeFile.updatedAt,
        parsedStatus: resumeParsed.status,
        parsedPageCount: resumeParsed.pageCount,
      })
      .from(resumeFile)
      .leftJoin(resumeParsed, eq(resumeFile.id, resumeParsed.resumeFileId))
      .where(eq(resumeFile.userId, userId))
      .orderBy(desc(resumeFile.createdAt))
      .limit(limit);

    return items;
  }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ resumeId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const [record] = await db
        .select()
        .from(resumeFile)
        .where(
          and(eq(resumeFile.id, input.resumeId), eq(resumeFile.userId, userId)),
        )
        .limit(1);

      if (!record || record.status !== 'uploaded') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not available.',
        });
      }

      const url = await getResumeDownloadUrl({ key: record.s3Key });
      return {
        url,
        expiresInSeconds: getS3Env().AWS_S3_PRESIGN_EXPIRES_SECONDS,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ resumeId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const [record] = await db
        .select()
        .from(resumeFile)
        .where(
          and(eq(resumeFile.id, input.resumeId), eq(resumeFile.userId, userId)),
        )
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found.',
        });
      }

      await deleteResumeObject({ key: record.s3Key });
      await db.delete(resumeFile).where(eq(resumeFile.id, record.id));

      return { success: true };
    }),

  parse: protectedProcedure
    .input(z.object({ resumeId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      await assertRateLimit({
        key: resumeRateLimitKey('parse', userId),
        limit: RESUME_PARSE_RATE_LIMIT.limit,
        windowSeconds: RESUME_PARSE_RATE_LIMIT.windowSeconds,
      });

      const [record] = await db
        .select()
        .from(resumeFile)
        .where(
          and(eq(resumeFile.id, input.resumeId), eq(resumeFile.userId, userId)),
        )
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found.',
        });
      }

      if (record.status !== 'uploaded') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Resume must be uploaded before parsing.',
        });
      }

      const [existingParsed] = await db
        .select()
        .from(resumeParsed)
        .where(eq(resumeParsed.resumeFileId, input.resumeId))
        .limit(1);

      if (existingParsed?.status === 'completed' && existingParsed.data) {
        return {
          parsedId: existingParsed.id,
          status: existingParsed.status,
          rawText: existingParsed.rawText,
          pageCount: existingParsed.pageCount,
          data: existingParsed.data,
        };
      }

      if (
        existingParsed?.status === 'pending' ||
        existingParsed?.status === 'parsing'
      ) {
        return {
          parsedId: existingParsed.id,
          status: existingParsed.status,
        };
      }

      const parsedId = existingParsed?.id ?? createId('parsed');

      if (existingParsed) {
        await db
          .update(resumeParsed)
          .set({ status: 'pending', errorMessage: null })
          .where(eq(resumeParsed.id, parsedId));
      } else {
        await db.insert(resumeParsed).values({
          id: parsedId,
          resumeFileId: input.resumeId,
          userId,
          status: 'pending',
        });
      }

      try {
        await enqueueResumeParse({ resumeId: input.resumeId, userId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to queue resume parse.';

        await db
          .update(resumeParsed)
          .set({ status: 'failed', errorMessage })
          .where(eq(resumeParsed.id, parsedId));

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to queue resume parsing.',
          cause: error,
        });
      }

      return {
        parsedId,
        status: 'pending',
      };
    }),

  getParsedContent: protectedProcedure
    .input(z.object({ resumeId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const [record] = await db
        .select()
        .from(resumeFile)
        .where(
          and(eq(resumeFile.id, input.resumeId), eq(resumeFile.userId, userId)),
        )
        .limit(1);

      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Resume not found.',
        });
      }

      const [parsed] = await db
        .select()
        .from(resumeParsed)
        .where(eq(resumeParsed.resumeFileId, input.resumeId))
        .limit(1);

      if (!parsed) {
        return null;
      }

      return {
        status: parsed.status,
        rawText: parsed.rawText,
        pageCount: parsed.pageCount,
        data: parsed.data,
        errorMessage: parsed.errorMessage,
      };
    }),
});
