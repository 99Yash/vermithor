import { useEffect, useState } from 'react';
import { LAST_AUTH_METHOD_KEY, type AuthOptionsType } from '~/lib/constants';
import { getLocalStorageItem } from '~/lib/utils';

export function useLastAuthMethod() {
  const [lastAuthMethod, setLastAuthMethod] =
    useState<AuthOptionsType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setLastAuthMethod(getLocalStorageItem(LAST_AUTH_METHOD_KEY) ?? null);
  }, []);

  return lastAuthMethod;
}
