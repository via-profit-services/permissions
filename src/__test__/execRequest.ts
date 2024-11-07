import {
  execute,
  GraphQLError,
  GraphQLSchema,
  parse,
  Source,
  validate,
  validateSchema,
  ValidationRule,
} from 'graphql';

const execRequest = async (params: {
  schema: GraphQLSchema;
  query: string;
  operationName: string;
  variableValues?: Record<string, unknown>;
  validationRules?: ValidationRule[];
}): Promise<{ readonly errors: readonly GraphQLError[] | null; data: unknown | null }> => {
  const { schema, operationName, variableValues, query, validationRules } = params;

  const graphqlErrors = validateSchema(schema);
  if (graphqlErrors.length) {
    return { errors: graphqlErrors, data: null };
  }

  const document = parse(new Source(query));
  const validationErrors = validate(schema, document, validationRules);

  if (validationErrors.length) {
    return { errors: validationErrors, data: null };
  }

  const { errors, data } = await execute({
    schema,
    document,
    operationName,
    variableValues,
  });

  if (errors && errors.length) {
    return { errors, data: null };
  }

  return { data, errors: null };
};

export default execRequest;
