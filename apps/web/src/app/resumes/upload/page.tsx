'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { authClient } from '~/lib/auth/client';
import { trpc } from '~/lib/trpc';

type UploadStatus = 'idle' | 'uploading' | 'confirming' | 'success' | 'error';

const PDF_CONTENT_TYPE = 'application/pdf';

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

export default function ResumeUploadPage() {
  const { data: session } = authClient.useSession();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const createUpload = useMutation(trpc.resumes.createUpload.mutationOptions());
  const confirmUpload = useMutation(trpc.resumes.confirmUpload.mutationOptions());

  const isBusy = status === 'uploading' || status === 'confirming';

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 py-10">
        <h1 className="text-2xl font-semibold">Upload resume</h1>
        <p className="text-sm text-muted-foreground">
          Please <Link href="/signin" className="underline">sign in</Link> to upload
          a resume.
        </p>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setStatus('idle');
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Select a PDF resume first.');
      return;
    }

    if (file.type !== PDF_CONTENT_TYPE) {
      setError('Only PDF files are supported.');
      return;
    }

    setError(null);
    setStatus('uploading');

    try {
      const upload = await createUpload.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      const formData = new FormData();
      Object.entries(upload.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const response = await fetch(upload.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      setStatus('confirming');
      await confirmUpload.mutateAsync({ resumeId: upload.resumeId });
      setStatus('success');
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Upload failed.';
      setError(message);
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Upload resume</h1>
        <p className="text-sm text-muted-foreground">
          PDF only. Stored privately and available to you only.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          disabled={isBusy}
        />
        {file ? (
          <p className="text-xs text-muted-foreground">
            {file.name} · {formatBytes(file.size)}
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {status === 'success' ? (
          <p className="text-sm text-emerald-600">Upload verified.</p>
        ) : null}
      </div>

      <Button onClick={handleUpload} disabled={!file || isBusy}>
        {isBusy ? 'Uploading...' : 'Upload resume'}
      </Button>
    </div>
  );
}
