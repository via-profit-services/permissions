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
    const { privileges, enableIntrospection, defaultAccess } = props;

    const resolver: PermissionsResolverFunction = (params) => {
      const { typeName, fieldName, permissions } = params;
      const pathWithoutField = `${typeName}.${SERVICE_PRIVILEGES.asterisk}`;
      const pathWithField = `${typeName}.${fieldName}`;
      const resolverWithoutField = permissions[pathWithoutField];
      const resolverWithField = permissions[pathWithField];

      const res: ReturnType<PermissionsResolverFunction> = {
        grant: [],
        restrict: [],
      };

      // append permission without field (e.g.: «MyType.*)
      if (typeof resolverWithoutField === 'function') {
        const f = (resolverWithoutField as PermissionsResolverFunction)(params);
        res.grant = res.grant.concat([...f.grant || []]);
        res.restrict = res.restrict.concat([...f.restrict || []]);
      }

      if (typeof resolverWithoutField === 'object') {
        const f = (resolverWithoutField as PermissionsResolverObject);
        res.grant = res.grant.concat([...f.grant || []]);
        res.restrict = res.restrict.concat([...f.restrict || []]);
      }

      // append permission with field (e.g.: «MyType.field»)
      if (typeof resolverWithField === 'function') {
        const f = (resolverWithField as PermissionsResolverFunction)(params);
        // console.log({ f })
        res.grant = res.grant.concat([...f.grant || []]);
        res.restrict = res.restrict.concat([...f.restrict || []]);
      }

      if (typeof resolverWithField === 'object') {
        const f = (resolverWithField as PermissionsResolverObject);
        res.grant = res.grant.concat([...f.grant || []]);
        res.restrict = res.restrict.concat([...f.restrict || []]);
      }

      // introspection control
      if (INTROSPECTION_FIELDS.includes(pathWithField)) {
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
        //   result: 'RESTRICT FALLBACK',
        //   typeName,
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
    //   result,
    //   typeName,
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
