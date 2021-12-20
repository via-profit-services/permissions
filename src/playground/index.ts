import { graphqlExpressFactory } from '@via-profit-services/core';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import * as permissions from '../index';
import schema from './schema';
import graphiql from './graphiql';

dotenv.config();

const PORT = 8085;
const app = express();
const server = http.createServer(app);
(async () => {
  // const isViewer = (props: any) => props.context.roles.includes('viewer');
  // const isAdmin = (props: any) => props.context.roles.includes('admin');
  const permissionsMiddleware = permissions.factory({
    enableIntrospection: true,
    permissions: {
      'User.*': () => false,
      'User.id': () => true,
      'User.name': () => true,
    },
  });

  const graphQLExpress = await graphqlExpressFactory({
    schema,
    debug: true,
    middleware: [
      ({ context }) => {
        (context as any).roles = ['viewer', 'dsds'];
      },
      permissionsMiddleware,
    ],
  });

  app.use('/graphql', graphQLExpress);
  app.use(
    '/',
    graphiql({
      query: `query UsersList {
  users {
    name
  }
}

query UsersListWithDeniedField {
  users {
    id
    name
    login # Access to this field is denied
    password # Access to this field is denied
  }
}`,
      variables: {},
      endpoint: '/graphql',
    }),
  );
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`GraphQL Playground started at http://localhost:${PORT}/`);
  });
})();
