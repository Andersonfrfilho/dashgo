import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { AppError } from '../errors/AppError';

let isRefreshing = false;
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { Authorization: `Bearer ${cookies['nextauth.token'] || '123'}` },
  });

  api.interceptors.response.use(
    response => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx);

          const { 'nextauth.refresh_token': refresh_token } = cookies;
          const originalConfig = error.config;
          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', {
                refresh_token,
              })
              .then(response => {
                const { token } = response.data;

                setCookie(ctx, 'nextauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/',
                });

                setCookie(
                  ctx,
                  'nextauth.refresh_token',
                  response.data.refresh_token,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: '/',
                  }
                );

                api.defaults.headers.Authorization = `Bearer ${token}`;

                failedRequestQueue.forEach(request => request.onSuccess(token));
                failedRequestQueue = [];
              })
              .catch(err => {
                failedRequestQueue.forEach(request => request.onFailure(err));
                failedRequestQueue = [];
                // verifica se esta rodando no servidor ou no backend
                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        }
        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(
            new AppError({
              message: 'user is not authenticated',
              status_code: 401,
            })
          );
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
