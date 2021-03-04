declare module '@via-profit-services/permissions' {
  import { Middleware, MiddlewareProps, Context, MaybePromise } from '@via-profit-services/core';
  import { ValidationRule, VisitFn, SelectionSetNode, ValidationContext } from 'graphql';
  
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
    config: MiddlewareProps['config'];
  }) => MaybePromise<ValidationRule>;

  export type ResolvePermissionsProps = {
    typeName: string;
    fieldName: string;
    visitor: {
      node: Parameters<VisitFn<any>>[0];
      key: Parameters<VisitFn<any>>[1];
      parent: Parameters<VisitFn<any>>[2];
      path: Parameters<VisitFn<any>>[3];
      ancestors: Parameters<VisitFn<any>>[4];
      validationContext: ValidationContext;
    };
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
    requirePrivileges: Privileges;
    defaultAccess: 'grant' | 'restrict';
    enableIntrospection: boolean;

    constructor(props: PermissionsServiceProps);

    resolvePermissions(props: ResolvePermissionsProps): boolean;
  }

  export const INTROSPECTION_FIELDS: string[];
  export const ASTERISK: '*';
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