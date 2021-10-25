import { IntrospectionProtector } from '@via-profit-services/permissions';
import { ValidationRule } from 'graphql';

const introspectionProtector: IntrospectionProtector = props => {
  const { configuration, context } = props;
  const { enableIntrospection } = configuration;
  const enable = typeof enableIntrospection !== 'undefined' ? enableIntrospection : false;

  const validationRule: ValidationRule = () => ({
    Field: node => {
      if (!enable && ['__schema', '__type'].includes(node.name.value)) {
        context.emitter.emit('permissions-error', 'GraphQL introspection is not allowed');
        throw new Error('GraphQL introspection is not allowed');
      }
    },
  });

  return validationRule;
};

export default introspectionProtector;
