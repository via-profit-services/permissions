import type {
  PermissionsService as PermissionsServiceInterface,
  PermissionsServiceProps,
  ResolvePermissionsProps,
  Permissions,
  Privileges,
  PermissionsResolverObject,
  PermissionsResolverFunction,
} from '@via-profit-services/permissions';

import { ASTERISK, INTROSPECTION_FIELDS } from './constants';

class PermissionsService implements PermissionsServiceInterface {
  props: PermissionsServiceProps;
  permissions: Permissions = {};
  privileges: Privileges = [];
  requirePrivileges: Privileges = [];
  defaultAccess: 'grant' | 'restrict' = 'restrict';
  enableIntrospection = false;

  public constructor(props: PermissionsServiceProps) {
    this.props = props;
  }

  // public setPrivileges(privileges: Privileges) {
  //   this.privileges = privileges;
  // }

  // public setPermissions(permissions: Permissions) {
  //   this.permissions = permissions;
  // }

  // public setRequirePrivileges(privileges: Privileges): void {
  //   this.requirePrivileges = privileges;
  // }

  // public getPrivileges(): Privileges {
  //   return this.privileges;
  // }

  // public getPermissions(): Permissions {
  //   return this.permissions;
  // }

  // public getRequirePrivileges(): Privileges {
  //   return this.requirePrivileges;
  // }


  public resolvePermissions (props: ResolvePermissionsProps): boolean {
    const { context } = this.props;

    const { typeName, fieldName } = props;
    const entityName = `${typeName}.${fieldName}`;

    const resolver: PermissionsResolverFunction = (params) => {
      const { typeName } = params;

      const fieldResolvers = [
        this.permissions[entityName],
        this.permissions[`${typeName}.${ASTERISK}`],
      ].filter((r) => r);

      const res: ReturnType<PermissionsResolverFunction> = {
        grant: [...this.requirePrivileges || []],
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
        res.grant = this.enableIntrospection ? [ASTERISK] : [];
        res.restrict = !this.enableIntrospection ? [ASTERISK] : [];
      }

      // correct asterisks in grant «*»
      // from grant: ['priv1', '*', 'priv2'] to grant: ['*']
      if (res.grant.includes(ASTERISK)) {
        res.grant = [ASTERISK];
      }

      // correct asterisks in restrict «*»
      // from restrict: ['priv1', '*', 'priv2'] to restrict: ['*']
      if (res.restrict.includes(ASTERISK)) {
        res.restrict = [ASTERISK];
      }

      return res;
    }

    const { restrict, grant } = resolver({
      ...props,
      context,
    });

    // combine restrict matches array
    const needToRestrict = [...restrict].map((negative) => {
      if (negative === ASTERISK) {
        return true;
      }

      return this.privileges.includes(negative);
    }).includes(true);


    // combine grant matches array
    const needToGrant = !grant.length ? (this.defaultAccess === 'grant') : grant.map((positive) => {
      if (
        this.privileges.includes(ASTERISK) ||
        positive === ASTERISK
        ) {
        return true;
      }

      return this.privileges.includes(positive);
    }).every((elem) => elem);

    const result = !needToRestrict && needToGrant;

    // check to default access
    if (this.defaultAccess === 'restrict' && result) {

      if (!grant.length) {
        console.log({
          entityName,
          result: 'RESTRICT FALLBACK',
          privileges: this.privileges,
          grant,
          restrict,
          needToGrant,
          needToRestrict,
        });

        return false;
      }
    }

    console.log({
      entityName,
      result,
      privileges: this.privileges,
      grant,
      restrict,
      needToGrant,
      needToRestrict,
    })

    return result;
  }


}

export default PermissionsService;
