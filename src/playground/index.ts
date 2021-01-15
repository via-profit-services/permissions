/* eslint-disable no-console */
import { factory } from '@via-profit-services/core';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

import * as permissions from '../index';
import anyMiddleware from './anyMiddleware';
import schema from './schema';

dotenv.config();

const PORT = 9005;
const app = express();
const server = http.createServer(app);
(async () => {


  const permissionsMiddleware = await permissions.factory({
    enableIntrospection: true,
    permissions: {
      'Query.info': { grant: ['*'] },
    },
  });


  const { graphQLExpress } = await factory({
    server,
    schema,
    debug: true,
    middleware: [
      permissionsMiddleware,
      anyMiddleware,
    ],
  });

  app.use(graphQLExpress);
  server.listen(PORT, () => {


    console.log(`GraphQL Server started at http://localhost:${PORT}/graphql`);
  })

})();
