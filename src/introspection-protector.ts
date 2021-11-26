import {
  IntrospectionProtector,
  IntrospectionProtectorGate,
} from '@via-profit-services/permissions';
import { ValidationRule } from 'graphql';

const introspectionProtector: IntrospectionProtector = props => {
  const { configuration, context } = props;
  const { enableIntrospection, permissions } = configuration;

  const validationRule: ValidationRule = () => ({
    Field: node => {
      const protectFn: IntrospectionProtectorGate = gateProps => {
        if (typeof enableIntrospection === 'function') {
          return Boolean(enableIntrospection(gateProps));
        }

        if (typeof enableIntrospection === 'boolean') {
          return enableIntrospection;
        }

        return false;
      };

      const introspectionAllow = protectFn({ context, permissions });

      if (!introspectionAllow && ['__schema', '__type'].includes(node.name.value)) {
        context.emitter.emit('permissions-error', 'GraphQL introspection is not allowed');
        throw new Error('GraphQL introspection is not allowed');
      }
    },
  });

  return validationRule;
};

export default introspectionProtector;
