import type { Middleware } from '@via-profit-services/core';
import type { MiddlewareFactory } from '@via-profit-services/permissions';

import introspectionProtectorFactory from './protectors/introspection';
import injectPermissionProtector from './protectors/schema-permission';

const factory: MiddlewareFactory = configuration => {
  const { permissions, enableIntrospection } = configuration;

  const middleware: Middleware = ({ schema, validationRule }) => {
    validationRule.push(introspectionProtectorFactory(enableIntrospection || false));

    injectPermissionProtector(schema, permissions);
  };

  return middleware;
};

export default factory;
