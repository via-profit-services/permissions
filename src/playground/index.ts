import { factory } from '@via-profit-services/core';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import * as permissions from '../index';
import schema from './schema';

dotenv.config();

const PORT = 8085;
const app = express();
const server = http.createServer(app);
(async () => {
  const isViewer = (props: any) => props.context.roles.includes('viewer');
  const isAdmin = (props: any) => props.context.roles.includes('admin');
  const permissionsMiddleware = permissions.factory({
    enableIntrospection: true,
    permissions: {
      'User.*': () => false,
      'User.name': () => true,
    },
  });

  const { graphQLExpress } = await factory({
    server,
    schema,
    debug: true,
    middleware: [
      ({ context }) => {
        (context as any).roles = ['viewer', 'dsds'];

        return {
          context,
        };
      },
      permissionsMiddleware,
    ],
  });

  app.use('/graphql', graphQLExpress);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`GraphQL Server started at http://localhost:${PORT}/graphql`);
  });
})();
