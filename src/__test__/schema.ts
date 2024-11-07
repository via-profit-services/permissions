import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import users from './users';

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
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: () => users,
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
