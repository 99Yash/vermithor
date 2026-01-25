import { z } from 'zod';

const s3EnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_S3_PRESIGN_EXPIRES_SECONDS: z.coerce.number().int().positive().default(300),
  AWS_S3_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  AWS_S3_KMS_KEY_ID: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export function getS3Env() {
  return s3EnvSchema.parse(process.env);
}
