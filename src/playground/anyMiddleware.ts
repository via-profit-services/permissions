import { Middleware } from '@via-profit-services/core';

const anyMiddleware: Middleware = (props) => {

  const { context } = props;
  const { services } = context;

  services.permissions.setPermissions({
    ...services.permissions.getPermissions(),
    'Query.info': () => ({ grant: ['server'] }),
    'InfoQuery.version': {
      grant: ['server'],
    },
  });

  const privileges = ['reader', 'server'].concat(services.permissions.getPrivileges());
  services.permissions.setPrivileges([...new Set(privileges)]);


  return {};
}

export default anyMiddleware;
