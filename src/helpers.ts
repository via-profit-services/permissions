import type { PermissionResolverOR, PermissionResolverAND, PermissionResolverCHAIN, PermissionResolverAllow, PermissionResolverNOT, PermissionResolverDeny } from '@via-profit-services/permissions';

const and: PermissionResolverAND = (resolvers) => async (props) => {
  const results = await Promise.all(
    resolvers.map((resolver) => resolver(props)),
  );

  const successResult = results.every((elem) => elem === true);
  const errorResult = results.find((elem) => elem !== true);

  return successResult || errorResult;
}

const or: PermissionResolverOR = (resolvers) => async (props) => {
  const results = await Promise.all(
    resolvers.map((resolver) => resolver(props)),
  );

  const successResult = results.find((elem) => elem === true);
  const errorResult = results.find((elem) => elem !== true);

  return typeof successResult !== 'undefined'
    ? true
    : errorResult;
}

const not: PermissionResolverNOT = (resolvers) => async (props) => {
  const results = await Promise.all(
    resolvers.map((resolver) => resolver(props)),
  );

  return results.every((elem) => elem !== true);
}

const chain: PermissionResolverCHAIN = (resolvers) => async (props) => {
  const results = await resolvers.reduce(async (prev, resolver) => {
    const prevRes = await prev;
    const currentRes = await resolver(props);

    return prevRes.concat([currentRes]);
  }, Promise.resolve([]));

  const successResult = results.every((elem) => elem === true);
  const errorResult = results.find((elem) => elem !== true);

  return successResult || errorResult;
}

const allow: PermissionResolverAllow = () => () => true;
const deny: PermissionResolverDeny = (message) => () => typeof message !== 'string' ? message : false;

export { or, and, chain, allow, deny, not };