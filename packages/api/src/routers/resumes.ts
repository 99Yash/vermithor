import { TRPCError } from '@trpc/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@vermithor/db';
import { createId } from '@vermithor/db/helpers';
import { resumeFile } from '@vermithor/db/schema/resume';
import { z } from 'zod';
import { getS3Env } from '../env';
import { protectedProcedure, router } from '../index';
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

      const head = await headResumeObject({ key: record.s3Key });
      const contentLength = head.ContentLength ?? 0;
      const contentType = head.ContentType ?? '';

      if (contentType !== PDF_CONTENT_TYPE) {
        await rejectUpload('Uploaded file is not a PDF.');
      }

      if (contentLength <= 0 || contentLength > env.AWS_S3_MAX_UPLOAD_BYTES) {
        await rejectUpload('Uploaded file failed size validation.');
      }

      const header = await readResumeHeader({ key: record.s3Key });
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

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const items = await db
      .select()
      .from(resumeFile)
      .where(eq(resumeFile.userId, userId))
      .orderBy(desc(resumeFile.createdAt));

    return items.map((item) => ({
      id: item.id,
      originalFileName: item.originalFileName,
      contentType: item.contentType,
      sizeBytes: item.sizeBytes,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
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
});
