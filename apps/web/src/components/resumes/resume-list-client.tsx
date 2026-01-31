'use client';

import type { AppRouter } from '@vermithor/api/routers/index';
import type { inferRouterOutputs } from '@trpc/server';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HardDrive,
  Layers,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { formatBytes, formatShortDate } from '~/lib/format';
import { trpc } from '~/lib/trpc';
import { cn, getErrorMessage } from '~/lib/utils';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ResumeListItem = RouterOutputs['resumes']['list'][number];
type ResumeStatus = ResumeListItem['status'];
type ParsedStatus = ResumeListItem['parsedStatus'];

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const toneStyles: Record<StatusTone, string> = {
  neutral: 'border-border/70 bg-background text-muted-foreground',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
  danger: 'border-destructive/40 bg-destructive/10 text-destructive',
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-600',
};

const DELETE_CONFIRM_MESSAGE = 'Are you sure you want to delete this resume?';

function assertNever(value: never): never {
  throw new Error(`Unhandled status: ${String(value)}`);
}

type StatusInfo = {
  value: string;
  tone: StatusTone;
  icon: typeof CheckCircle2;
  spin?: boolean;
};

type StatusPillProps = {
  value: string;
  tone: StatusTone;
  icon: typeof CheckCircle2;
  spin?: boolean;
  title?: string;
};

function StatusPill({ value, tone, icon: Icon, spin, title }: StatusPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        toneStyles[tone],
      )}
      title={title}
    >
      <Icon className={cn('size-3', spin && 'animate-spin')} />
      <span>{value}</span>
    </div>
  );
}

function getFileStatus(status: ResumeStatus): StatusInfo {
  switch (status) {
    case 'uploaded':
      return { value: 'Uploaded', tone: 'success', icon: CheckCircle2 };
    case 'rejected':
      return { value: 'Rejected', tone: 'danger', icon: XCircle };
    case 'pending':
      return { value: 'Checking', tone: 'warning', icon: Clock };
  }

  return assertNever(status);
}

function getParseStatus(
  status: ResumeStatus,
  parsedStatus: ParsedStatus,
): StatusInfo {
  if (status !== 'uploaded') {
    return { value: 'Waiting', tone: 'neutral', icon: Clock };
  }

  switch (parsedStatus) {
    case 'completed':
      return { value: 'Parsed', tone: 'success', icon: CheckCircle2 };
    case 'parsing':
      return {
        value: 'Parsing',
        tone: 'info',
        icon: Loader2,
        spin: true,
      };
    case 'failed':
      return { value: 'Failed', tone: 'danger', icon: AlertCircle };
    case null:
    case 'pending':
      return { value: 'Ready', tone: 'neutral', icon: Clock };
  }

  return assertNever(parsedStatus);
}

type ResumeListClientProps = {
  className?: string;
};

export function ResumeListClient({ className }: ResumeListClientProps) {
  const queryClient = useQueryClient();
  const listQueryOptions = trpc.resumes.list.queryOptions();
  const { data: resumes, isLoading, error } = useQuery(listQueryOptions);

  const deleteMutation = useMutation({
    ...trpc.resumes.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey });
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError));
    },
  });

  const parseMutation = useMutation({
    ...trpc.resumes.parse.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryOptions.queryKey });
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError));
    },
  });

  const handleDownload = async (resumeId: string) => {
    try {
      const result = await queryClient.fetchQuery(
        trpc.resumes.getDownloadUrl.queryOptions({ resumeId }),
      );
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = (resumeId: string) => {
    if (confirm(DELETE_CONFIRM_MESSAGE)) {
      deleteMutation.mutate({ resumeId });
    }
  };

  const handleParse = (resumeId: string) => {
    parseMutation.mutate({ resumeId });
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-lg border border-destructive/50 bg-destructive/5 p-4', className)}>
        <p className="text-sm text-destructive">Failed to load resumes</p>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center',
          className,
        )}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background">
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">No resumes yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a PDF above and we will start validating immediately.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {resumes.map((resume) => {
        const fileStatus = getFileStatus(resume.status);
        const parseStatus = getParseStatus(resume.status, resume.parsedStatus);
        const isParseActionPending =
          parseMutation.isPending &&
          parseMutation.variables?.resumeId === resume.id;
        const isDeletePending =
          deleteMutation.isPending &&
          deleteMutation.variables?.resumeId === resume.id;
        const isRejected = resume.status === 'rejected';
        const isParsing = resume.parsedStatus === 'parsing' || isParseActionPending;
        const downloadDisabled = resume.status !== 'uploaded';

        return (
          <div
            key={resume.id}
            className="group rounded-xl border border-border/60 bg-card/80 p-4 shadow-xs transition hover:border-border hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
                  <FileText className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {resume.originalFileName}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="size-3" />
                      {formatBytes(resume.sizeBytes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatShortDate(resume.createdAt)}
                    </span>
                    {resume.parsedPageCount && (
                      <span className="inline-flex items-center gap-1">
                        <Layers className="size-3" />
                        {resume.parsedPageCount} pg
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      value={fileStatus.value}
                      tone={fileStatus.tone}
                      icon={fileStatus.icon}
                      title={`Upload: ${fileStatus.value}`}
                    />
                    <StatusPill
                      value={parseStatus.value}
                      tone={parseStatus.tone}
                      icon={parseStatus.icon}
                      spin={parseStatus.spin}
                      title={`Parse: ${parseStatus.value}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {resume.status === 'uploaded' &&
                  resume.parsedStatus !== 'completed' &&
                  resume.parsedStatus !== 'parsing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleParse(resume.id)}
                      disabled={isParseActionPending}
                    >
                      <RefreshCw
                        className={cn(
                          'mr-2 size-3.5',
                          isParseActionPending && 'animate-spin',
                        )}
                      />
                      Parse
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => handleDownload(resume.id)}
                  disabled={downloadDisabled}
                  title="Download"
                  aria-label="Download resume"
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(resume.id)}
                  disabled={isDeletePending}
                  title="Delete"
                  aria-label="Delete resume"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {isParsing && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-600">
                <Loader2 className="size-3 animate-spin" />
                Parsing in the background.
              </div>
            )}

            {isRejected && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="size-3" />
                Validation failed. Upload another PDF.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
