import type { ValidatioRuleMiddleware } from '@via-profit-services/permissions';
import { GraphQLError, BREAK } from 'graphql';

const validationRuleMiddleware: ValidatioRuleMiddleware = async (props) => {
  const { context, configuration, config } = props;
  const {
    permissions, enableIntrospection,
    defaultAccess, requirePrivileges,
  } = configuration;
  const { services, logger } = context;
  const { debug } = config;

  let isIntrospection = false;

  return (validationContext) => ({
    enter: (node) => {
      const type = validationContext.getType();

      // skip if is not a GraphQL type
      if (!type) {
        return undefined;
      }


      // introspection detect
      if (['__Schema!', '__Type'].includes(type.toString())) {
        isIntrospection = true;
      }

      // if is introspection query, then skip it
      if (isIntrospection) {
        return undefined;
      }

      const typeName = type.toString().replace(/[![\]]/gmi, '');


      if (node && node.kind === 'SelectionSet') {
        node.selections.forEach((selectionNode) => {
          if (selectionNode.kind === 'Field') {
            const fieldName = selectionNode.name.value;
            const validationResult = services.permissions.resolvePermissions({
              permissions: {
                ...services.permissions.getPermissions(),
                ...permissions,
              },
              privileges: services.permissions.getPrivileges(),
              typeName,
              fieldName,
              enableIntrospection,
              requirePrivileges,
              defaultAccess,
            });

            if (!validationResult) {
              const errMessage = [
                `Permission denied for key «${typeName}.${fieldName}»`,
                'Make sure that you have permissions for this field',
              ];

              if (debug) {
                if (services.permissions.getPrivileges().length) {
                  errMessage.push(`Your privileges: ${services.permissions.getPrivileges().join('; ')}`);
                } else {
                  errMessage.push('You don\'t have any privileges');
                }
              }

              logger.permissions.info(errMessage);
              validationContext.reportError(
                new GraphQLError(errMessage.join('. ')),
              );

              return BREAK;
            }
          }

          return undefined;
        });
      }

      return undefined;
    },
    leave: () => {
      const type = validationContext.getType();

      if (type && type.toString() === '__Schema!') {
        isIntrospection = false;
      }
    },
  });
}


export default validationRuleMiddleware;
