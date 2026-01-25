'use client';

import { useMutation } from '@tanstack/react-query';
import { FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
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
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createUpload = useMutation(trpc.resumes.createUpload.mutationOptions());
  const confirmUpload = useMutation(
    trpc.resumes.confirmUpload.mutationOptions(),
  );

  const file = files[0] ?? null;
  const isBusy = status === 'uploading' || status === 'confirming';
  const isInvalid = Boolean(error);

  const statusText =
    status === 'uploading'
      ? 'Uploading to secure storage...'
      : status === 'confirming'
        ? 'Verifying upload...'
        : status === 'success'
          ? 'Upload verified.'
          : status === 'error'
            ? 'Upload failed.'
            : 'Ready to upload.';

  const statusTone =
    status === 'success'
      ? 'text-emerald-600'
      : status === 'error'
        ? 'text-destructive'
        : 'text-muted-foreground';

  const isPdfFile = (candidate: File) =>
    candidate.type === PDF_CONTENT_TYPE ||
    candidate.name.toLowerCase().endsWith('.pdf');

  const applyFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;

    const [nextFile, ...extraFiles] = incoming;

    if (!isPdfFile(nextFile)) {
      setFiles([]);
      setStatus('idle');
      setError('Only PDF files are supported.');
      return;
    }

    setFiles([nextFile]);
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
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (isBusy) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (isBusy) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
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
    if (isBusy) return;
    event.preventDefault();
    setIsDragging(false);
    const incoming = Array.from(event.dataTransfer.files);
    applyFiles(incoming);
  };

  const handleRemoveFile = () => {
    setFiles([]);
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
        <div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          aria-disabled={isBusy}
          aria-invalid={isInvalid}
          onClick={openFileDialog}
          onKeyDown={handleDropzoneKeyDown}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center outline-none transition-colors',
            'hover:bg-accent/30 focus-visible:border-ring/50 focus-visible:ring-ring/30 focus-visible:ring-[3px]',
            isBusy && 'cursor-not-allowed opacity-60',
            isDragging && 'border-primary/40 bg-accent/30',
            isInvalid && 'border-destructive/60 bg-destructive/5',
          )}
        >
          <div className="flex items-center justify-center rounded-full border bg-background p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-medium text-sm">Drag & drop your resume here</p>
            <p className="text-muted-foreground text-xs">
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
                {error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : null}
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

        {!file && error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>

      <Button onClick={handleUpload} disabled={!file || isBusy}>
        {status === 'confirming'
          ? 'Confirming...'
          : isBusy
            ? 'Uploading...'
            : 'Upload resume'}
      </Button>
    </div>
  );
}
