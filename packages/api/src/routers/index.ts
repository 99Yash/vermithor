import { protectedProcedure, publicProcedure, router } from "../index";
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
	streaming: streamingRouter,
});
export type AppRouter = typeof appRouter;
