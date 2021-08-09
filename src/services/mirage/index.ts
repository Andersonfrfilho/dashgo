import {
  createServer,
  Factory,
  Model,
  Response,
  ActiveModelSerializer,
} from 'miragejs';
import faker from 'faker';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const auth = {
  secret: 'supersecret',
} as const;
export type DecodedToken = {
  sub: string;
};
type User = {
  name: string;
  email: string;
  permissions: string[];
  roles: string[];
  password: string;
  created_at: string;
};

type User_Token = {
  refresh_token: string;
  email: string;
  token: string;
};

export function makeServer() {
  const server = createServer({
    serializers: {
      application: ActiveModelSerializer,
    },
    models: {
      user: Model.extend<Partial<User>>({}),
      user_token: Model.extend<Partial<User_Token>>({}),
    },
    factories: {
      user: Factory.extend({
        name() {
          return `${faker.name.firstName().toLocaleLowerCase()} ${faker.name
            .lastName()
            .toLocaleLowerCase()}`;
        },
        password() {
          return '102030';
        },
        permissions() {
          return ['admin', 'user'];
        },
        roles() {
          return ['add_user', 'not_add_user'];
        },
        email(index: number) {
          return `user${index + 1}@mail.com`;
        },
        createdAt() {
          return faker.date.recent(10);
        },
      }),
    },

    seeds(serverParams) {
      serverParams.createList('user', 200);
    },
    routes() {
      this.namespace = 'api';
      this.timing = 750; // testar carregamentos
      this.post('/sessions', function (schema, request) {
        const { email, password } = JSON.parse(request.requestBody);

        const user = schema.findBy('user', { email });

        if (!user) {
          return new Response(404, undefined, {
            message: 'User does not exist.',
          });
        }

        if (user.password !== password) {
          return new Response(401, undefined, {
            message: 'E-mail or password incorrect.',
          });
        }
        const token = jwt.sign({ email }, auth.secret, {
          subject: email,
          expiresIn: 10, // 15 minutes
        });

        const refresh_token = uuidv4();

        schema.create('user_token', {
          token,
          refresh_token,
          email,
        });

        return new Response(200, undefined, {
          token,
          refresh_token,
          email,
        });
      });
      this.get('/users', function (schema, request) {
        const { page = 1, per_page = 10 } = request.queryParams;
        const total = schema.all('user').length;
        const pageStart = (Number(page) - 1) * Number(per_page);
        const pageEnd = pageStart + Number(per_page);
        const users = this.serialize(schema.all('user')).users.slice(
          pageStart,
          pageEnd
        );

        return new Response(200, { 'x-total-count': String(total) }, { users });
      });

      this.get('/users/:id');
      this.get('/me', function (schema, request) {
        // const { Authorization: authorization } = request.requestHeaders;
        // if (!authorization) {
        //   return new Response(403, undefined, {
        //     message: 'Token not found.',
        //   });
        // }
        // const [, token] = authorization?.split(' ');
        // const { sub: email } = jwt.verify(
        //   token as string,
        //   auth.secret
        // ) as DecodedToken;

        const user = schema.all('user');

        // if (!user) {
        //   return new Response(404, undefined, {
        //     message: 'User does not exist.',
        //   });
        // }

        return new Response(200, undefined, { user: user[0] });
      });
      this.post('/users');

      this.namespace = '';
      this.passthrough();
    },
  });
  return server;
}
