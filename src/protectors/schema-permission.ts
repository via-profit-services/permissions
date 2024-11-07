import type { Context } from '@via-profit-services/core';
import type {
  InjectPermissionProtector,
  PermissionResolverResponse,
  PermissionsMap,
} from '@via-profit-services/permissions';
import {
  isObjectType,
  isIntrospectionType,
  GraphQLResolveInfo,
  GraphQLFieldMap,
  GraphQLField as OriginalGraphQLField,
  GraphQLSchema,
} from 'graphql';

type GraphQLField = OriginalGraphQLField<unknown, unknown> & {
  [key: symbol]: boolean;
};

const injectPermissionProtector: InjectPermissionProtector = (
  schema: GraphQLSchema,
  permissions: PermissionsMap,
) => {
  const AFFECTED_MARKER_SYMBOL = Symbol('Marker');

  const types = schema.getTypeMap();

  // fallback resolver
  const noopResolve = async (
    parent: unknown,
    _args: unknown,
    _context: Context,
    info: GraphQLResolveInfo,
  ) => (parent ? parent[info.fieldName as keyof typeof parent] : undefined);

  // visit all types
  Object.entries(types).forEach(([typeName, type]) => {
    if (isObjectType(type) && !isIntrospectionType(type)) {
      const fields = type.getFields() as GraphQLFieldMap<unknown, Context>;

      // visit all fields of each type
      Object.entries(fields).forEach(([fieldName, field]) => {
        // prevent double visits
        if ((field as GraphQLField)[AFFECTED_MARKER_SYMBOL]) {
          return;
        }

        // check permissions
        if (permissions?.[`${typeName}.${fieldName}`] || permissions?.[`${typeName}.*`]) {
          const { resolve } = field;

          // If a resolver was provided, then we must return it as is.
          // If there was no resolver, then we return an empty resolver
          const originalResolver = resolve || noopResolve;
          field.resolve = async (source, args, context, info) => {
            const defaultGrant = true;
            const results: PermissionResolverResponse[] = [defaultGrant];

            await Object.entries(permissions || {}).reduce(async (prev, [keyPath, rule]) => {
              await prev;

              if (keyPath === `${typeName}.${fieldName}` || keyPath === `${typeName}.*`) {
                const keyPathRes = await rule({
                  source,
                  args,
                  context,
                  info,
                });

                results.push(keyPathRes);
              }
            }, Promise.resolve());

            const result = results.reverse()[0];

            if (result !== true) {
              const message = [`Permission denied for key «${typeName}.${fieldName}».`];
              if (typeof result === 'string') {
                message.push(result);
              }

              throw new Error(message.join(' '));
            }

            return await originalResolver(source, args, context, info);
          };
          (field as GraphQLField)[AFFECTED_MARKER_SYMBOL] = true;
        }
      });
    }
  });
};

export default injectPermissionProtector;
