import { createContext } from '@vermithor/api/context';
import { appRouter } from '@vermithor/api/routers/index';
import { auth } from '@vermithor/auth';
import { cors } from '@elysiajs/cors';
import { node } from '@elysiajs/node';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import 'dotenv/config';
import { Elysia } from 'elysia';
import { getServerEnv } from './env';

const env = getServerEnv();
const corsOrigins = new Set<string>([
  ...env.CORS_ORIGIN,
  ...env.FRONTEND_URL,
]);

if (env.NODE_ENV !== 'production') {
  corsOrigins.add('http://localhost:3000');
  corsOrigins.add('http://localhost:3001');
}

new Elysia({ adapter: node() })
  .use(
    cors({
      origin: corsOrigins.size > 0 ? Array.from(corsOrigins) : false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'trpc-accept',
        'trpc-batch-mode',
      ],
      credentials: true,
    })
  )
  .all('/api/auth/*', async (context) => {
    const { request, status } = context;
    if (['POST', 'GET'].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all('/trpc/*', async (context) => {
    const res = await fetchRequestHandler({
      endpoint: '/trpc',
      router: appRouter,
      req: context.request,
      createContext: () => createContext({ context }),
    });
    return res;
  })
  .get('/', () => 'OK')
  .listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
  });
