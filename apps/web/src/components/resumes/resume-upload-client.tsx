'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { formatBytes } from '~/lib/format';
import { trpc } from '~/lib/trpc';
import { cn, getErrorMessage } from '~/lib/utils';

type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'confirming'
  | 'parsing'
  | 'success'
  | 'error';

const PDF_CONTENT_TYPE = 'application/pdf';
const STATUS_COPY: Record<UploadStatus, { text: string; tone: string }> = {
  idle: { text: 'Ready to upload.', tone: 'text-muted-foreground' },
  uploading: {
    text: 'Uploading to secure storage...',
    tone: 'text-muted-foreground',
  },
  confirming: { text: 'Verifying upload...', tone: 'text-muted-foreground' },
  parsing: { text: 'Queueing parse...', tone: 'text-muted-foreground' },
  success: { text: 'Resume queued for parsing.', tone: 'text-emerald-600' },
  error: { text: 'Upload failed.', tone: 'text-destructive' },
};

const RESUME_UPLOAD_ERROR_ID = 'resume-upload-error';

type ResumeUploadClientProps = {
  className?: string;
};

export function ResumeUploadClient({ className }: ResumeUploadClientProps) {
  const queryClient = useQueryClient();
  const listQueryOptions = trpc.resumes.list.queryOptions();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createUpload = useMutation(trpc.resumes.createUpload.mutationOptions());
  const confirmUpload = useMutation(
    trpc.resumes.confirmUpload.mutationOptions(),
  );
  const parseResume = useMutation({
    ...trpc.resumes.parse.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey });
    },
  });

  const isBusy =
    status === 'uploading' || status === 'confirming' || status === 'parsing';
  const isInvalid = Boolean(error);
  const errorMessageClassName = file
    ? 'text-xs text-destructive'
    : 'text-sm text-destructive';

  const { text: statusText, tone: statusTone } = STATUS_COPY[status];

  const isPdfFile = (candidate: File) =>
    candidate.type === PDF_CONTENT_TYPE ||
    candidate.name.toLowerCase().endsWith('.pdf');

  const applyFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    const [nextFile, ...extraFiles] = incoming;

    if (!isPdfFile(nextFile)) {
      setFile(null);
      setStatus('idle');
      setError('Only PDF files are supported.');
      return;
    }

    setFile(nextFile);
    setStatus('idle');
    setError(
      extraFiles.length > 0
        ? 'Only one resume can be uploaded at a time.'
        : null,
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    applyFiles(incoming);
    event.target.value = '';
  };

  const openFileDialog = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleBrowseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openFileDialog();
  };

  const handleDropzoneKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    if (isBusy) return;
    openFileDialog();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isBusy) return;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isBusy) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isBusy) return;
    const relatedTarget = event.relatedTarget;
    if (
      relatedTarget &&
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const incoming = Array.from(event.dataTransfer.files);
    applyFiles(incoming);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Select a PDF resume first.');
      return;
    }

    if (!isPdfFile(file)) {
      setError('Only PDF files are supported.');
      return;
    }

    const contentType = file.type || PDF_CONTENT_TYPE;
    setError(null);
    setStatus('uploading');

    try {
      const upload = await createUpload.mutateAsync({
        fileName: file.name,
        contentType,
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

      setStatus('parsing');
      await parseResume.mutateAsync({ resumeId: upload.resumeId });
      setStatus('success');
    } catch (uploadError: unknown) {
      setError(getErrorMessage(uploadError));
      setStatus('error');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="button"
        tabIndex={isBusy ? -1 : 0}
        aria-disabled={isBusy}
        aria-invalid={isInvalid}
        aria-describedby={error ? RESUME_UPLOAD_ERROR_ID : undefined}
        aria-errormessage={error ? RESUME_UPLOAD_ERROR_ID : undefined}
        onClick={openFileDialog}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center outline-none transition-colors',
          'hover:bg-accent/30 focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/30',
          isBusy && 'cursor-not-allowed opacity-60',
          isDragging && 'border-primary/40 bg-accent/30',
          isInvalid && 'border-destructive/60 bg-destructive/5',
        )}
      >
        <div className="flex items-center justify-center rounded-full border bg-background p-2.5">
          <Upload className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium">Drag & drop your resume here</p>
          <p className="text-xs text-muted-foreground">
            Or click to browse (PDF only)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-fit"
          onClick={handleBrowseClick}
          disabled={isBusy}
        >
          Browse files
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          disabled={isBusy}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {file ? (
        <div role="list" className="flex flex-col gap-2">
          <div
            role="listitem"
            className="flex items-center gap-3 rounded-md border p-3"
          >
            <div className="flex size-10 items-center justify-center rounded border bg-accent/50">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
              <p className={cn('text-xs', statusTone)}>{statusText}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleRemoveFile}
              disabled={isBusy}
            >
              <X className="size-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          id={RESUME_UPLOAD_ERROR_ID}
          role="alert"
          className={errorMessageClassName}
        >
          {error}
        </p>
      ) : null}

      <Button onClick={handleUpload} disabled={!file || isBusy}>
        {status === 'parsing'
          ? 'Queueing...'
          : status === 'confirming'
            ? 'Confirming...'
            : status === 'uploading'
              ? 'Uploading...'
              : 'Upload resume'}
      </Button>
    </div>
  );
}
