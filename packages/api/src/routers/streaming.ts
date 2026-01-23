import type { LanguageModelV3StreamPart } from "@ai-sdk/provider";
import {
  JsonToSseTransformStream,
  parseJsonEventStream,
  simulateReadableStream,
  streamText,
  uiMessageChunkSchema,
  type InferUIMessageChunk,
} from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { createAsyncIterableStream } from "ai-stream-utils/utils";
import { TextEncoderStream, TransformStream } from "node:stream/web";
import { z } from "zod";
import { publicProcedure, router } from "../index";
import { generateId } from "../streaming/ids";
import { getStreamContext } from "../streaming/stream-context";
import {
  getResumeSession,
  saveResumeSession,
  upsertResumeMessage,
} from "../streaming/store";
import type { ResumeUIMessage } from "../streaming/types";

const MOCK_RESPONSE = `Here are focused resume improvements:\n\n- Tighten your summary to 2-3 lines that highlight scope, impact, and domain.\n- Rewrite bullets to use strong verbs + metrics (e.g., reduced latency by 35%).\n- Group skills by category and remove anything you cannot defend in an interview.\n- Move most relevant projects above education to match target roles.\n- Add a short leadership or ownership section if you led cross-team work.\n`;

function textToChunks(text: string): Array<LanguageModelV3StreamPart> {
  const words = text.split(" ");
  const textId = generateId("text");

  return [
    { type: "text-start", id: textId },
    ...words.map(
      (word) =>
        ({
          type: "text-delta",
          id: textId,
          delta: `${word} `,
        }) as const
    ),
    { type: "text-end", id: textId },
    {
      type: "finish",
      finishReason: { raw: undefined, unified: "stop" },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: words.length, text: words.length, reasoning: undefined },
      },
    },
  ];
}

export const streamingRouter = router({
  listMessages: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await getResumeSession(input.sessionId);
      return {
        sessionId: session.sessionId,
        messages: session.messages,
      };
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        message: z.custom<ResumeUIMessage>(),
      })
    )
    .mutation(async function* ({
      input,
    }): AsyncGenerator<InferUIMessageChunk<ResumeUIMessage>> {
      const { sessionId, message } = input;

      const session = await upsertResumeMessage(sessionId, message);
      const activeStreamId = generateId("stream");
      const sessionWithStream = { ...session, activeStreamId };
      await saveResumeSession(sessionWithStream);

      const model = new MockLanguageModelV3({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: textToChunks(MOCK_RESPONSE),
            initialDelayInMs: 250,
            chunkDelayInMs: 120,
          }),
        }),
      });

      const result = streamText({
        model,
        prompt: "resume-improvement",
      });

      const uiStream = result.toUIMessageStream({
        originalMessages: sessionWithStream.messages,
        generateMessageId: () => generateId("msg"),
        onFinish: async ({ messages }) => {
          await saveResumeSession({
            ...sessionWithStream,
            messages,
            activeStreamId: null,
          });
        },
      });

      const [trpcStream, redisStream] = uiStream.tee();
      const sseStream = redisStream.pipeThrough(new JsonToSseTransformStream());

      const streamContext = await getStreamContext();
      streamContext.createNewResumableStream(activeStreamId, () => sseStream);

      yield* createAsyncIterableStream(trpcStream);
    }),

  resumeMessage: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async function* ({
      input,
    }): AsyncGenerator<InferUIMessageChunk<ResumeUIMessage>> {
      const session = await getResumeSession(input.sessionId);

      if (!session.activeStreamId) {
        return;
      }

      const streamContext = await getStreamContext();
      const resumedStream = await streamContext.resumeExistingStream(
        session.activeStreamId
      );

      if (!resumedStream) {
        return;
      }

      const encodedStream = resumedStream.pipeThrough(new TextEncoderStream());

      const chunkStream = parseJsonEventStream({
        stream: encodedStream,
        schema: uiMessageChunkSchema,
      }).pipeThrough(
        new TransformStream({
          transform(result, controller) {
            if (result.success) {
              controller.enqueue(result.value);
            }
          },
        })
      );

      yield* createAsyncIterableStream(chunkStream);
    }),
});
