import type { ValidationRule } from 'graphql';
import type { IntrospectionProtector } from '@via-profit-services/permissions';


const introspectionProtector: IntrospectionProtector = enableIntrospection => {
  const validationRule: ValidationRule = () => ({
    Field: node => {
      const introspectionAllow =
        typeof enableIntrospection === 'function' ? enableIntrospection() : enableIntrospection;

      if (!introspectionAllow && ['__schema', '__type'].includes(node.name.value)) {
        throw new Error('GraphQL introspection is not allowed');
      }
    },
  });

  return validationRule;
};

export default introspectionProtector;
