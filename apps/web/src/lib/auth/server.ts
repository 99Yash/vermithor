import { createAuthServerClient } from '@vermithor/auth';

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export const authServer = createAuthServerClient(SERVER_URL);
