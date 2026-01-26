import { createAuthServerClient } from '@vermithor/auth';
import { serverUrl } from '~/lib/env';

export const authServer = createAuthServerClient(serverUrl);
