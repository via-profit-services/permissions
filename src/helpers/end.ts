import type { PermissionResolverAND } from '@via-profit-services/permissions';

const and: PermissionResolverAND = resolvers => async props => {
  const results = await Promise.all(resolvers.map(resolver => resolver(props)));

  const successResult = results.every(elem => elem === true);
  const errorResult = results.find(elem => elem !== true);

  return Boolean(successResult || errorResult);
};

export default and;
