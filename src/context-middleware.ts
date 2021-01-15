import { MiddlewareProps, Context } from '@via-profit-services/core';
import type { Configuration } from '@via-profit-services/permissions';

import logger from './logger';
import PermissionsService from './PermissionsService';

interface Props {
  context: Context;
  configuration: Required<Configuration>;
  config: MiddlewareProps['config'];
}

const contextMiddleware = async (props: Props): Promise<Context> => {

  const { context, config, configuration } = props;
  const { logDir } = config;
  const { defaultAccess, enableIntrospection, permissions, requirePrivileges } = configuration;

  // Permissions Service
  context.services.permissions = new PermissionsService({ context });
  context.services.permissions.defaultAccess = defaultAccess;
  context.services.permissions.enableIntrospection = enableIntrospection;
  context.services.permissions.permissions = permissions;
  context.services.permissions.requirePrivileges = requirePrivileges;

  // Authorization Logger
  context.logger.permissions = logger({ logDir });

  return context;
}

export default contextMiddleware;
