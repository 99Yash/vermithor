import type { InferUITools, UIMessage } from "ai";

type ResumeMetadata = {
  resumeId?: string;
};

type ResumeDataPart = {};

type ResumeTools = InferUITools<{}>;

export type ResumeUIMessage = UIMessage<ResumeMetadata, ResumeDataPart, ResumeTools>;

export type ResumeSession = {
  sessionId: string;
  messages: ResumeUIMessage[];
  activeStreamId: string | null;
};
