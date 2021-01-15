import { Middleware } from '@via-profit-services/core';
import type { Configuration, PermissionsMiddlewareFactory } from '@via-profit-services/permissions';

import contextMiddleware from './context-middleware';
import validationRuleMiddleware from './validation-rule-middleware';

const accountsMiddlewareFactory: PermissionsMiddlewareFactory = async (props) => {

  const configuration: Required<Configuration> = {
    permissions: {},
    requirePrivileges: [],
    enableIntrospection: false, // default value
    defaultAccess: 'restrict', // default value
    ...props,
  }


  const pool: ReturnType<Middleware> = {
    context: null,
    validationRule: null,
  };

  const middleware: Middleware = async (props) => {

    const { context } = props;

    // define static context at once
    pool.context = pool.context ?? await contextMiddleware({
      config: props.config,
      context: context,
      configuration,
    });

    pool.validationRule = await validationRuleMiddleware({
      context: pool.context,
      config: props.config,
      configuration,
    });

    return pool;
  }

  return middleware;
}

export default accountsMiddlewareFactory;
