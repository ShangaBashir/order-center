import React, { createContext, useContext, useRef, useCallback } from 'react';

type GuardFn = (targetPath: string) => boolean;

interface NavigationGuardContextType {
  registerGuard: (guard: GuardFn) => () => void;
  canNavigate: (targetPath: string) => boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextType>({
  registerGuard: () => () => {},
  canNavigate: () => true,
});

export const NavigationGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const guardRef = useRef<GuardFn | null>(null);

  const registerGuard = useCallback((guard: GuardFn) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) {
        guardRef.current = null;
      }
    };
  }, []);

  const canNavigate = useCallback((targetPath: string) => {
    if (guardRef.current) {
      return guardRef.current(targetPath);
    }
    return true;
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ registerGuard, canNavigate }}>
      {children}
    </NavigationGuardContext.Provider>
  );
};

export const useNavigationGuard = () => useContext(NavigationGuardContext);
