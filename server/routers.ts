import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { dataRouter } from "./routers/dataRouter";
import { exportRouter } from "./routers/exportRouter";
import { reportRouter } from "./routers/reportRouter";
import { searchRouter } from "./routers/searchRouter";
import { searchExportRouter } from "./routers/searchExportRouter";
import { analysisRouter } from "./routers/analysisRouter";
import { propertiesRouter } from "./routers/propertiesRouter";

export const appRouter = router({
  system: systemRouter,
  data: dataRouter,
  export: exportRouter,
  reports: reportRouter,
  search: searchRouter,
  searchExport: searchExportRouter,
  analysis: analysisRouter,
  properties: propertiesRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
