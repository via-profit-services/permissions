import type { PermissionResolverAllow } from '@via-profit-services/permissions';

const allow: PermissionResolverAllow = () => () => true;

export default allow;
