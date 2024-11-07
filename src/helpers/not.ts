import type { PermissionResolverNOT } from '@via-profit-services/permissions';

const not: PermissionResolverNOT = resolvers => async props => {
  const results = await Promise.all(resolvers.map(resolver => resolver(props)));

  return results.every(elem => elem !== true);
};

export default not;
