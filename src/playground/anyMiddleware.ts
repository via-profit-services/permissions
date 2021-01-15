import { Middleware } from '@via-profit-services/core';

const anyMiddleware: Middleware = (props) => {

  const { context } = props;
  const { services } = context;
const auth = true;
  services.permissions.setPermissions({
    ...services.permissions.getPermissions(),
    'Query.*': () => ({
      restrict: !auth ? ['*'] : [],
    }),
    'Query.info': () => ({ grant: ['server'] }),
    'InfoQuery.version': {
      grant: ['reader'],
    },
  });

  const privileges = ['reader' ].concat(services.permissions.getPrivileges());
  services.permissions.setPrivileges([...new Set(privileges)]);


  return {};
}

export default anyMiddleware;
