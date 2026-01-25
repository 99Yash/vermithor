'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import * as z from 'zod/v4';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { useLastAuthMethod } from '~/hooks/use-last-auth-method';
import { authClient } from '~/lib/auth/client';
import { LAST_AUTH_METHOD_KEY } from '~/lib/constants';
import { getErrorMessage, setLocalStorageItem } from '~/lib/utils';

const signInSchema = z.object({
  email: z.email().max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(1, 'Name is required'),
});

type SignInPayload = z.infer<typeof signInSchema>;
type SignUpPayload = z.infer<typeof signUpSchema>;
type AuthMode = 'signin' | 'signup';

export function EmailSignIn() {
  const router = useRouter();
  const lastAuthMethod = useLastAuthMethod();
  const [mode, setMode] = React.useState<AuthMode>('signin');

  const [isLoading, setIsLoading] = React.useState(false);

  const persistLastAuthMethod = () => {
    setLocalStorageItem(LAST_AUTH_METHOD_KEY, 'EMAIL');
  };

  const runAuth = async ({
    action,
    fallbackError,
    successMessage,
  }: {
    action: () => Promise<{ error?: { message?: string } } | undefined>;
    fallbackError: string;
    successMessage: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await action();
      if (result?.error) {
        toast.error(result.error.message ?? fallbackError);
        return;
      }

      persistLastAuthMethod();
      router.replace('/dashboard');
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async ({ email, password }: SignInPayload) => {
    await runAuth({
      action: () =>
        authClient.signIn.email({
          email,
          password,
          callbackURL: '/dashboard',
        }),
      fallbackError: 'Invalid email or password.',
      successMessage: 'Successfully signed in!',
    });
  };

  const handleSignUp = async ({ email, password, name }: SignUpPayload) => {
    await runAuth({
      action: () =>
        authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: '/dashboard',
        }),
      fallbackError: 'Sign up failed.',
      successMessage: 'Account created!',
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const schema = mode === 'signup' ? signUpSchema : signInSchema;
    const { success, data, error } = schema.safeParse(
      Object.fromEntries(formData),
    );

    if (!success) {
      toast.error(error.message);
      return;
    }

    if (mode === 'signup') {
      await handleSignUp(data);
      return;
    }

    await handleSignIn(data);
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      {mode === 'signup' ? (
        <div className="grid gap-1">
          <Input
            name="name"
            placeholder="Your name"
            type="text"
            autoComplete="name"
            className="bg-background"
            required
          />
        </div>
      ) : null}
      <div className="grid gap-1">
        <Input
          name="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="bg-background"
          required
        />
      </div>
      <div className="grid gap-1">
        <Input
          name="password"
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          className="bg-background"
          required
        />
      </div>
      <Button disabled={isLoading} type="submit" className="relative">
        {isLoading ? (
          <Spinner className="mr-2 bg-background" />
        ) : (
          mode === 'signup' ? 'Create account' : 'Sign In with Email'
        )}
        {mode === 'signin' && lastAuthMethod === 'EMAIL' && (
          <i className="text-xs absolute right-4 text-muted text-center">
            Last used
          </i>
        )}
      </Button>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="justify-start px-0 text-muted-foreground"
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
        disabled={isLoading}
      >
        {mode === 'signup'
          ? 'Already have an account? Sign in'
          : "New here? Create an account"}
      </Button>
    </form>
  );
}
