import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers, typeDefs } from '@via-profit-services/core';

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
  ],
  resolvers: [
    resolvers,
  ],
});

export default schema;
