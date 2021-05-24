declare module '@via-profit-services/permissions' {
  import { Middleware, Context, MaybePromise } from '@via-profit-services/core';
  import { GraphQLFieldResolver, GraphQLResolveInfo, ValidationRule, GraphQLField, GraphQLObjectType, GraphQLSchema } from 'graphql';

  export type Configuration = {
    permissions: PermissionsMap;
    enableIntrospection?: boolean;
  };
  export type IntrospectionProtector = (config: Configuration) => ValidationRule;
  export type MiddlewareFactory = (config: Configuration) => Middleware;

  export type PermissionResolverProps = {
    source: unknown;
    args: Record<string, unknown>;
    context: Context;
    info: GraphQLResolveInfo;
  }

  export type PermissionsMap = Record<string, PermissionResolver>;

  export type PermissionResolverResponse = true | false | string;
  export type PermissionResolver = (props: PermissionResolverProps) => MaybePromise<PermissionResolverResponse>;
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

  interface LoggersCollection {
    /**
     * Permissions logger \
     * \
     * Transports:
     *  - `debug` - File transport
     */
    permissions: Logger;
  }

}