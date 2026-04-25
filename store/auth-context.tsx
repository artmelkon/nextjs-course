import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
});

type Props = { children: ReactNode; initialLoggedIn: boolean };

export function AuthContextProvider({ children, initialLoggedIn }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  const login = useCallback(function login() {
    setIsLoggedIn(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
