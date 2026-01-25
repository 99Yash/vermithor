import { protectedProcedure, publicProcedure, router } from "../index";
import { resumesRouter } from "./resumes";
import { streamingRouter } from "./streaming";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
  resumes: resumesRouter,
	streaming: streamingRouter,
});
export type AppRouter = typeof appRouter;
