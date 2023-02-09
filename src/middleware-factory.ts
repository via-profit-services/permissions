import { Middleware, Context } from '@via-profit-services/core';
import type {
  MiddlewareFactory,
  PermissionResolverResponse,
} from '@via-profit-services/permissions';
import {
  isObjectType,
  isIntrospectionType,
  GraphQLResolveInfo,
  GraphQLFieldMap,
  ValidationRule,
} from 'graphql';

import introspectionProtectorFactory from './introspection-protector';

const factory: MiddlewareFactory = configuration => {
  const { permissions } = configuration;
  const AFFECTED_MARKER_SYMBOL = Symbol('Marker');
  let introspectionProtector: ValidationRule;
  const middleware: Middleware = ({ schema, context, validationRule }) => {
    // define validation rule
    if (!introspectionProtector) {
      introspectionProtector = introspectionProtectorFactory({ configuration, context });
      validationRule.push(introspectionProtector);
    }

    const types = schema.getTypeMap();

    // fallback resolver
    const noopResolve = async (
      parent: any,
      _args: any,
      _context: Context,
      info: GraphQLResolveInfo,
    ) => (parent ? parent[info.fieldName] : undefined);

    // visit all types
    Object.entries(types).forEach(([typeName, type]) => {
      if (isObjectType(type) && !isIntrospectionType(type)) {
        const fields = type.getFields() as GraphQLFieldMap<any, Context>;

        // visit all fields of each type
        Object.entries(fields).forEach(([fieldName, field]) => {
          // prevent double visits
          if ((field as any)[AFFECTED_MARKER_SYMBOL]) {
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

              await Object.entries(permissions || {}).reduce(async (prev, [keyPath, reule]) => {
                await prev;

                if (keyPath === `${typeName}.${fieldName}` || keyPath === `${typeName}.*`) {
                  const keyPathRes = await reule({
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

                context.emitter.emit('permissions-error', message.join(' '));
                throw new Error(message.join(' '));
              }

              return await originalResolver(source, args, context, info);
            };
            (field as any)[AFFECTED_MARKER_SYMBOL] = true;
          }
        });
      }
    });
  };

  return middleware;
};

export default factory;
