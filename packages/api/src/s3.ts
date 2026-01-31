import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'node:stream';
import { getS3Env } from './env';

type ArrayBufferSource = {
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function hasArrayBuffer(body: unknown): body is ArrayBufferSource {
  return (
    typeof body === 'object' &&
    body !== null &&
    'arrayBuffer' in body &&
    typeof (body as { arrayBuffer?: unknown }).arrayBuffer === 'function'
  );
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    return Buffer.alloc(0);
  }

  if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  if (hasArrayBuffer(body)) {
    const buffer = await body.arrayBuffer();
    return Buffer.from(buffer);
  }

  return Buffer.alloc(0);
}

const s3Client = new S3Client({ region: getS3Env().AWS_REGION });

type PresignedPostConditions = NonNullable<
  Parameters<typeof createPresignedPost>[1]['Conditions']
>;

export function buildResumeKey({
  userId,
  resumeId,
}: {
  userId: string;
  resumeId: string;
}) {
  return `resumes/${userId}/${resumeId}.pdf`;
}

export async function createResumeUploadPost({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) {
  const env = getS3Env();
  const fields: Record<string, string> = {
    key,
    'Content-Type': contentType,
  };
  const conditions: PresignedPostConditions = [
    ['content-length-range', 1, env.AWS_S3_MAX_UPLOAD_BYTES],
    ['eq', '$Content-Type', contentType],
    ['eq', '$key', key],
  ];

  if (env.AWS_S3_KMS_KEY_ID) {
    fields['x-amz-server-side-encryption'] = 'aws:kms';
    fields['x-amz-server-side-encryption-aws-kms-key-id'] = env.AWS_S3_KMS_KEY_ID;
    conditions.push(['eq', '$x-amz-server-side-encryption', 'aws:kms']);
    conditions.push([
      'eq',
      '$x-amz-server-side-encryption-aws-kms-key-id',
      env.AWS_S3_KMS_KEY_ID,
    ]);
  }

  return createPresignedPost(s3Client, {
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    Fields: fields,
    Conditions: conditions,
    Expires: env.AWS_S3_PRESIGN_EXPIRES_SECONDS,
  });
}

export async function getResumeDownloadUrl({ key }: { key: string }) {
  const env = getS3Env();
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: env.AWS_S3_PRESIGN_EXPIRES_SECONDS,
  });
}

export async function headResumeObject({ key }: { key: string }) {
  const env = getS3Env();
  return s3Client.send(
    new HeadObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function deleteResumeObject({ key }: { key: string }) {
  const env = getS3Env();
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function readResumeHeader({ key }: { key: string }) {
  const env = getS3Env();
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Range: 'bytes=0-4',
    })
  );

  return streamToBuffer(response.Body);
}

export async function readResumeFile({ key }: { key: string }): Promise<Buffer> {
  const env = getS3Env();
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  );

  return streamToBuffer(response.Body);
}
