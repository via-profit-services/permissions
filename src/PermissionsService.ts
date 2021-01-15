import type {
  PermissionsService as PermissionsServiceInterface,
  PermissionsServiceProps,
  ResolvePermissionsProps,
  Permissions,
  Privileges,
  PermissionsResolverObject,
  PermissionsResolverFunction,
} from '@via-profit-services/permissions';

import { SERVICE_PRIVILEGES, INTROSPECTION_FIELDS } from './constants';

class PermissionsService implements PermissionsServiceInterface {
  props: PermissionsServiceProps;
  permissions: Permissions = {};
  privileges: Privileges = [];

  public constructor(props: PermissionsServiceProps) {
    this.props = props;
  }

  public setPrivileges(privileges: Privileges) {
    this.privileges = privileges;
  }

  public setPermissions(permissions: Permissions) {
    this.permissions = permissions;
  }

  public getPrivileges(): Privileges {
    return this.privileges;
  }

  public getPermissions(): Permissions {
    return this.permissions;
  }


  public resolvePermissions (props: ResolvePermissionsProps): boolean {
    const { context } = this.props;
    const { privileges, enableIntrospection, defaultAccess, typeName, fieldName } = props;
    const entityName = `${typeName}.${fieldName}`;

    const resolver: PermissionsResolverFunction = (params) => {
      const { typeName, permissions, requirePrivileges } = params;

      const fieldResolvers = [
        permissions[entityName],
        permissions[`${typeName}.${SERVICE_PRIVILEGES.asterisk}`],
      ].filter((r) => r);

      const res: ReturnType<PermissionsResolverFunction> = {
        grant: [...requirePrivileges || []],
        restrict: [],
      };

      fieldResolvers.forEach((fieldResolver) => {
        if (typeof fieldResolver === 'function') {
          const { grant, restrict } = (fieldResolver as PermissionsResolverFunction)(params);
          res.grant = res.grant.concat([...grant || []]);
          res.restrict = res.restrict.concat([...restrict || []]);
        }

        if (typeof fieldResolver === 'object') {
          const { grant, restrict } = (fieldResolver as PermissionsResolverObject);
          res.grant = res.grant.concat([...grant || []]);
          res.restrict = res.restrict.concat([...restrict || []]);
        }
      });


      // introspection control
      if (INTROSPECTION_FIELDS.includes(entityName)) {
        res.grant = enableIntrospection ? [SERVICE_PRIVILEGES.asterisk] : [];
        res.restrict = !enableIntrospection ? [SERVICE_PRIVILEGES.asterisk] : [];
      }

      // correct asterisks in grant «*»
      // from grant: ['priv1', '*', 'priv2'] to grant: ['*']
      if (res.grant.includes(SERVICE_PRIVILEGES.asterisk)) {
        res.grant = [SERVICE_PRIVILEGES.asterisk];
      }

      // correct asterisks in restrict «*»
      // from restrict: ['priv1', '*', 'priv2'] to restrict: ['*']
      if (res.restrict.includes(SERVICE_PRIVILEGES.asterisk)) {
        res.restrict = [SERVICE_PRIVILEGES.asterisk];
      }

      return res;
    }

    const { restrict, grant } = resolver({
      ...props,
      context,
    });

    // combine restrict matches array
    const needToRestrict = [...restrict].map((negative) => {
      if (negative === SERVICE_PRIVILEGES.asterisk) {
        return true;
      }

      return privileges.includes(negative);
    }).includes(true);


    // combine grant matches array
    const needToGrant = !grant.length ? (defaultAccess === 'grant') : grant.map((positive) => {
      if (
        privileges.includes(SERVICE_PRIVILEGES.asterisk) ||
        positive === SERVICE_PRIVILEGES.asterisk
        ) {
        return true;
      }

      return privileges.includes(positive);
    }).every((elem) => elem);

    const result = !needToRestrict && needToGrant;

    // check to default access
    if (defaultAccess === 'restrict' && result) {

      if (!grant.length) {
        // console.log({
        //   entityName,
        //   result: 'RESTRICT FALLBACK',
        //   privileges,
        //   grant,
        //   restrict,
        //   needToGrant,
        //   needToRestrict,
        // });

        return false;
      }
    }

    // console.log({
    //   entityName,
    //   result,
    //   privileges,
    //   grant,
    //   restrict,
    //   needToGrant,
    //   needToRestrict,
    // })

    return result;
  }


}

export default PermissionsService;
