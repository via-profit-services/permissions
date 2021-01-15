declare module '@via-profit-services/permissions' {
  import { Middleware, MiddlewareProps, Context, MaybePromise } from '@via-profit-services/core';
  import { ValidationRule } from 'graphql';
  
  export interface Configuration {

    /**
     * Array of privileges to require as grant
     */
    requirePrivileges?: string[];

    /**
     * If `grant` then you will get access to the type if no permissions are set for it \
     * Default: `restrict`
     */
    defaultAccess?: 'grant' | 'restrict';

    /**
     * Introspection control \
     * Default: `false`
     */
    enableIntrospection?: boolean;

    /**
     * Permissions map \
     * For example:
     * ```js
     * {
     *   'Query.books': {
     *     grant: ['read.books'],
     *     restrict: ['read.books'],
     *   },
     *   'Book.award': () => ({
     *     grant: ['author'],
     *   }),
     * }
     * ```
     */
    permissions?: Permissions;
  }



  export type Permissions = Record<string, PermissionsResolver>;

  export type Privileges = string[];

  export type PermissionsResolverObject = {
    grant?: string[];
    restrict?: string[];
  };

  export type PermissionsResolverFunction = (
    props: Required<ResolvePermissionsProps> & {
      context: Context;
    }
  ) => PermissionsResolverObject;

  export type PermissionsResolver = PermissionsResolverObject | PermissionsResolverFunction;
  
  export type PermissionsMiddlewareFactory = (config: Configuration) => Promise<Middleware>;

   export type ValidatioRuleMiddleware = (props: {
    context: Context;
    configuration: Required<Configuration>;
    config: MiddlewareProps['config'];
  }) => MaybePromise<ValidationRule>;

  export type ResolvePermissionsProps = Required<Configuration> & {
    typeName: string;
    fieldName: string;
    privileges: string[];
    enableIntrospection: boolean;
    permissions: Record<string, PermissionsResolver>;
  };

  /**
   * Permissions service constructor props
   */
  export interface PermissionsServiceProps {
    context: Context;
  }

  class PermissionsService {
    props: PermissionsServiceProps;
    permissions: Permissions;
    privileges: Privileges;

    constructor(props: PermissionsServiceProps);

    setPermissions(permissions: Permissions): void;
    setPrivileges(list: Privileges): void;
    getPrivileges(): Privileges;
    getPermissions(): Permissions;
    resolvePermissions(props: ResolvePermissionsProps): boolean;
  }

  export const INTROSPECTION_FIELDS: string[];
  export const SERVICE_PRIVILEGES: Record<string, string>;
  export const DEFAULT_PERMISSIONS: Record<string, PermissionsResolver>;
  export const factory: PermissionsMiddlewareFactory;
}


declare module '@via-profit-services/core' {
  import { PermissionsService, Permissions, Privileges } from '@via-profit-services/permissions';
  
  interface ServicesCollection {

    /**
     * Permissions service
     */
    permissions: PermissionsService;
  }
  

  interface LoggersCollection {
    /**
     * Permissions logger \
     * \
     * Transports:
     *  - `debug` - File transport
     *  - `error` - Console transport
     */
    permissions: Logger;
  }

}