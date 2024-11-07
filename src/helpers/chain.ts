import type {
  PermissionResolverCHAIN,
  PermissionResolverResponse,
} from '@via-profit-services/permissions';

const chain: PermissionResolverCHAIN = resolvers => async props => {
  const results = await resolvers.reduce(async (prev, resolver) => {
    const prevRes = await prev;
    const currentRes = await resolver(props);

    return prevRes.concat([currentRes]);
  }, Promise.resolve<PermissionResolverResponse[]>([]));

  const successResult = results.every(elem => elem === true);
  const errorResult = results.find(elem => elem !== true);

  return Boolean(successResult || errorResult);
};

export default chain;
