import type { PermissionResolverDeny } from '@via-profit-services/permissions';

const deny: PermissionResolverDeny = message => () =>
  typeof message === 'string' ? message : false;

export default deny;
