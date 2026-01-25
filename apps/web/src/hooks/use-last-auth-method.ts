import { useEffect, useState } from 'react';
import type { AuthOptionsType } from '~/lib/constants';
import { getLocalStorageItem } from '~/lib/utils';

export function useLastAuthMethod() {
  const [lastAuthMethod, setLastAuthMethod] =
    useState<AuthOptionsType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setLastAuthMethod(getLocalStorageItem('LAST_AUTH_METHOD') ?? null);
  }, []);

  return lastAuthMethod;
}
