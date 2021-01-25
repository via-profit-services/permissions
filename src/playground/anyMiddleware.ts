import { Middleware } from '@via-profit-services/core';

const anyMiddleware: Middleware = (props) => {

  const { context } = props;
  const { services } = context;
  const auth = true;
  services.permissions.permissions = {
    ...services.permissions.permissions,
    'Query.*': () => ({
      restrict: !auth ? ['*'] : [],
    }),
    'Query.info': () => ({ grant: ['server'] }),
    'InfoQuery.version': {
      grant: ['reader'],
    },
  };

  const privileges = ['reader', 'server' ].concat(services.permissions.privileges);
  services.permissions.privileges = ([...new Set(privileges)]);


  return {};
}

export default anyMiddleware;
