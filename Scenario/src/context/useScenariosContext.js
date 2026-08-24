import { createContext, useContext } from 'react';

/* The context object and its hook live apart from the provider component on
   purpose: a module that exports both a component and something else opts out
   of Fast Refresh, so editing the provider would full-reload the app instead of
   hot-swapping. Keeping the non-component half here keeps refresh working. */

export const ScenariosContext = createContext(null);

export function useScenariosContext() {
  const context = useContext(ScenariosContext);
  if (!context) {
    throw new Error('useScenariosContext must be used within a ScenariosProvider');
  }
  return context;
}
