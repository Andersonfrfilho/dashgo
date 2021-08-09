import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import decode from 'jwt-decode';
import { validateUserPermission } from './validateUserPermissions';

type WithSSRAuthOptions = {
  permissions: string[];
  roles: string[];
};

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token);

      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermission({
        user,
        permissions,
        roles,
      });
      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }
    }
    try {
      return await fn(ctx);
    } catch (error) {
      destroyCookie(ctx, 'nextauth.token');
      destroyCookie(ctx, 'nextauth.refresh_token');
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  };
}
