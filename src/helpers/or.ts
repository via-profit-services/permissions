import type { PermissionResolverOR } from '@via-profit-services/permissions';

const or: PermissionResolverOR = resolvers => async props => {
  const results = await Promise.all(resolvers.map(resolver => resolver(props)));

  const successResult = results.find(elem => elem === true);
  const errorResult = results.find(elem => elem !== true);

  return Boolean(typeof successResult !== 'undefined' ? true : errorResult);
};

export default or;
