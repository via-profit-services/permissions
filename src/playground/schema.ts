import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import users from './users';

/**
 * Simple GraphQL schema
 *
 * SDL of this schema:
 * ```graphql
 * type Query {
 *   users: [User]!
 *   user(id: ID!): User
 * }
 *
 * type User {
 *   id: ID!
 *   name: String!
 * }
 * ```
 */
const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    login: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      users: {
        type: new GraphQLNonNull(new GraphQLList(User)),
        resolve: async (_parent, _args, _context) => users,
      },
      user: {
        type: User,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
        },
        resolve: async (_parent, args, _context) => {
          const { id } = args;
          const user = users.find(u => u.id === id);

          return user || null;
        },
      },
    }),
  }),
});

export default schema;
