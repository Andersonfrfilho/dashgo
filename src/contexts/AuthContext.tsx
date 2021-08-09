import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { AppError } from '../errors/AppError';
import { api } from '../services/apiClient';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

let authChannel = new BroadcastChannel('auth');

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refresh_token');
  authChannel.postMessage('logout');
  Router.push('/');
}
export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;
  useEffect(() => {
    authChannel = new BroadcastChannel('auth');
    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    };
  }, []);
  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();
    if (token) {
      api
        .get('/me', {
          headers: { Authorization: token },
        })
        .then(response => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', {
        email,
        password,
      });

      const { permissions, roles, token, refresh_token } = response.data;
      // sempre que executar do lado do browser deixe undefined
      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setCookie(undefined, 'nextauth.refresh_token', refresh_token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.Authorization = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err) {
      throw new AppError({
        message: err.response.data.message,
        status_code: err.response.status,
      });
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
