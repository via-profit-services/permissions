import { Middleware, ServerError, LoggersCollection } from '@via-profit-services/core';
import type { MiddlewareFactory, PermissionResolverResponse } from '@via-profit-services/permissions';
import { isObjectType, isIntrospectionType, GraphQLResolveInfo } from 'graphql';

import introspectionProtector from './introspection-protector';
import logger from './logger';

const factory: MiddlewareFactory = (configuration) => {
  const { permissions } = configuration;
  const reportError = (props: {
    result: PermissionResolverResponse,
    namedPath: string,
    logger: LoggersCollection,
  }) => {
    const { result, namedPath, logger } = props;
    const message = [
      `Permission denied for key «${namedPath}».`,
    ];
    if (typeof result === 'string') {
      message.push(result);
    }

    logger.permissions.debug(
      message.join(' '),
      { rejectionRule: namedPath },
    );
    throw new ServerError(
      message.join(' '),
      { rejectionRule: namedPath },
    );
  }
  const AFFECTED_MARKER_SYMBOL = Symbol('marker');
  const middleware: Middleware = ({ schema, context, config }) => {
    const { logDir } = config;
    context.logger.permissions = logger({
      logDir,
    });

    const types = schema.getTypeMap();
    const noopResolve = async (parent: any, _args: any, _context: any, info: GraphQLResolveInfo) =>
      parent ? parent[info.fieldName] : undefined;


    Object.entries(types).forEach(([typeName, type]) => {
      if (isObjectType(type) && !isIntrospectionType(type)) {
        const fields = type.getFields();
        Object.entries(fields).forEach(([fieldName, field]) => {
          if ((field as any)[AFFECTED_MARKER_SYMBOL]) {
            return;
          }

          if (permissions?.[`${typeName}.${fieldName}`] || permissions?.[`${typeName}.*`]) {
            const { resolve } = field;
            const originalResolver = resolve || noopResolve;
            field.resolve = async (source, args, context, info) => {
              const defaultGrant = true;
              const results: (string | boolean)[] = [defaultGrant];

              await Object.entries(permissions || {}).reduce(async (prev, [keyPath, reule]) => {
                await prev;

                if (keyPath === `${typeName}.${fieldName}` || keyPath === `${typeName}.*`) {
                  const keyPathRes = await reule({
                    source, args, context, info,
                  });

                  results.push(keyPathRes);
                }

              }, Promise.resolve());


              const result = results.reverse()[0];

              if (result !== true) {
                reportError({
                  result,
                  namedPath: `${typeName}.${fieldName}`,
                  logger: context.logger,
                });
              }

              return await originalResolver(source, args, context, info);
            };
            (field as any)[AFFECTED_MARKER_SYMBOL] = true;
          }
        })
      }
    });

    const retData = {
      context,
      validationRule: introspectionProtector(configuration),
      schema,
      // schema: fieldsWrapper(schema, async (props) => {
      //   const { info, context } = props;
      //   const { logger } = context;
      //   const { fieldName, parentType, operation } = info;
      //   const namedPath = `${parentType.toString()}.${fieldName}`;
      //   const globalPath = `${parentType.toString()}.*`;
      //   const operationType = operation.operation as 'query' | 'mutation';
      //   const fullPath = `${operationType}.${namedPath}`;

      //   // cache
      //   if (cacheMap.has({ request, fullPath })) {
      //     const result = cacheMap.get({ request, fullPath });
      //     if (result !== true) {
      //       reportError({
      //         result,
      //         namedPath,
      //         logger,
      //       });
      //     }

      //     return props;
      //   }


      //   // exec
      //   const defaultGrant = true;
      //   const results: (string | boolean)[] = [defaultGrant];
      //   await Object.entries(permissions?.[operationType] || {})
      //     .reduce(async (prev, [keyPath, resolver]) => {
      //     await prev;

      //     if (keyPath === namedPath || keyPath === globalPath) {
      //       const keyPathRes = await resolver(props);
      //       results.push(keyPathRes);

      //       return;
      //     }

      //   }, Promise.resolve())

      //   // get last results. Last result is primary and overrides previous results
      //   const result = results.reverse()[0];

      //   // cached
      //   cacheMap.set({ request, fullPath }, result);

      //   if (result !== true) {
      //     reportError({
      //       result,
      //       namedPath,
      //       logger,
      //     });
      //   }

      //   return props;
      // }, { wrapWithoutResolvers: true }),
    };

    return retData;
  }

  return middleware;
}

export default factory;