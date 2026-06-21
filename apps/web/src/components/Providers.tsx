'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { initSession } from '@/store/cartSlice';
import { getStoredTokens, apiGetMe, apiRefresh, storeTokens, clearTokens } from '@/lib/auth';

function AuthHydrator() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    store.dispatch(initSession());

    const tokens = getStoredTokens();
    if (!tokens) return;

    apiGetMe(tokens.accessToken)
      .then((user) => {
        store.dispatch(setCredentials({ user, ...tokens }));
      })
      .catch(async () => {
        try {
          const fresh = await apiRefresh(tokens.refreshToken);
          storeTokens(fresh.accessToken, fresh.refreshToken);
          const user = await apiGetMe(fresh.accessToken);
          store.dispatch(setCredentials({ user, ...fresh }));
        } catch {
          clearTokens();
        }
      });
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
