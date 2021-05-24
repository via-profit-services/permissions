import { IntrospectionProtector } from '@via-profit-services/permissions';
import { ValidationRule } from 'graphql';

const introspectionProtector: IntrospectionProtector = (config) => {
  const { enableIntrospection } = config;
  const enable = typeof enableIntrospection !== 'undefined' ? enableIntrospection : false;

  const validationRule: ValidationRule = () => ({
    Field: (node) => {
      if (!enable && ['__schema', '__type'].includes(node.name.value)) {
				throw new Error(
          'GraphQL introspection is not allowed',
        );
			}
    },
  });

  return validationRule;
};

export default introspectionProtector;
