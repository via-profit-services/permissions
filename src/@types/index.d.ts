declare module '@via-profit-services/permissions' {
  import { Middleware, Context, MaybePromise } from '@via-profit-services/core';
  import {
    GraphQLFieldResolver,
    GraphQLResolveInfo,
    ValidationRule,
    GraphQLField,
    GraphQLObjectType,
    GraphQLSchema,
  } from 'graphql';

  export type Configuration = {
    permissions: PermissionsMap;

    /**
     * Boolean or a function that returns a boolean value.\
     * If `true`, access to introspection is possible. Otherwise, no.\
     * Default: `false`\
     * \
     * **Note**: You cannot use promise as the return value of a function\
     * Example:
     * ```js
     * // Access to introspection is denied to everyone
     * const permissionsMiddleware = permissions.factory({
     *   enableIntrospection: ({ context }) => process.env.NODE_ENV === 'development',
     *   permissions: {
     *     ...
     *   },
     * });
     * ```
     */
    enableIntrospection?: IntrospectionProtectorGate | boolean;
  };
  
  export type IntrospectionProtectorProps = {
    configuration: Configuration;
    context: Context;
  };

  export type IntrospectionProtectorGateProps = {
    context: Context;
    permissions: PermissionsMap;
  };

  export type IntrospectionProtector = (config: IntrospectionProtectorProps) => ValidationRule;
  export type IntrospectionProtectorGate = (config: IntrospectionProtectorGateProps) => boolean;
  export type MiddlewareFactory = (config: Configuration) => Middleware;

  export type PermissionResolverProps = {
    source: unknown;
    args: Record<string, unknown>;
    context: Context;
    info: GraphQLResolveInfo;
  };

  export type PermissionsMap = Record<string, PermissionResolver>;

  export type PermissionResolverResponse = true | false | string;
  export type PermissionResolver = (
    props: PermissionResolverProps,
  ) => MaybePromise<PermissionResolverResponse>;
  export type PermissionResolverAllow = () => PermissionResolver;
  export type PermissionResolverDeny = (message?: string) => PermissionResolver;
  export type PermissionResolverOR = (resolvers: PermissionResolver[]) => PermissionResolver;
  export type PermissionResolverAND = (resolvers: PermissionResolver[]) => PermissionResolver;
  export type PermissionResolverNOT = (resolvers: PermissionResolver[]) => PermissionResolver;
  export type PermissionResolverCHAIN = (resolvers: PermissionResolver[]) => PermissionResolver;

  export const factory: MiddlewareFactory;
  export const or: PermissionResolverOR;
  export const and: PermissionResolverAND;
  export const chain: PermissionResolverCHAIN;
  export const allow: PermissionResolverAllow;
  export const deny: PermissionResolverDeny;
  export const not: PermissionResolverNOT;

  /**
   *
   *
   */
  type Args = Record<string, unknown>;
  export type Source = any;

  export type MutatedField = GraphQLField<Source, Context, Args> & Record<string, boolean>;
  export type MutatedObjectType = GraphQLObjectType<Source, Context> & Record<string, boolean>;

  export type FieldResolver = (
    source: Source,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo,
  ) => GraphQLFieldResolver<Source, Context, Args>;

  export type ResolversWrapperFunction = (props: {
    resolve: FieldResolver;
    source: Source;
    args: Args;
    context: Context;
    info: GraphQLResolveInfo;
  }) => MaybePromise<{
    resolve?: FieldResolver;
    source?: Source;
    args?: Args;
    context?: Context;
    info?: GraphQLResolveInfo;
  }>;

  export type NoopResolver = GraphQLFieldResolver<Source, Context, Args>;

  export type ResolversWrapper = (
    schema: GraphQLSchema,
    wrapper: ResolversWrapperFunction,
  ) => GraphQLSchema;
}

declare module '@via-profit-services/core' {
  interface CoreEmitter {
    on(event: 'permissions-error', listener: (msk: string) => void): this;
    once(event: 'permissions-error', listener: (msk: string) => void): this;
    addListener(event: 'permissions-error', listener: (msk: string) => void): this;
    removeListener(event: 'permissions-error', listener: (msk: string) => void): this;
    prependListener(event: 'permissions-error', listener: (msk: string) => void): this;
    prependOnceListener(event: 'permissions-error', listener: (msk: string) => void): this;
    emit(event: 'permissions-error', ...args: Parameters<(msk: string) => void>): boolean;
    removeAllListeners(event: 'permissions-error'): this;
    listeners(event: 'permissions-error'): Function[];
    listenerCount(event: 'permissions-error'): number;
  }
}
