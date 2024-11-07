import { injectPermissionProtector, deny, allow, introspectionProtector } from '../index';
import schema from './schema';
import execRequest from './execRequest';

test('Return the Permisison error', async () => {
  const permissionsMap = {
    'User.*': deny(),
    'User.id': allow(),
    'User.name': allow(),
  };

  injectPermissionProtector(schema, permissionsMap);

  const query = /* GraphQL */ `
    query TestQuery {
      users {
        name
        password
      }
    }
  `;

  const validationRule = introspectionProtector(true);
  const { errors } = await execRequest({
    schema,
    query,
    validationRules: [validationRule],
    operationName: 'TestQuery',
  });

  expect(errors?.length).toBe(1);
});


test('Return the success', async () => {
  const permissionsMap = {
    'User.*': deny(),
    'User.id': allow(),
    'User.name': allow(),
  };

  injectPermissionProtector(schema, permissionsMap);

  const query = /* GraphQL */ `
    query TestQuery {
      users {
        name
      }
    }
  `;

  const validationRule = introspectionProtector(true);
  const { errors } = await execRequest({
    schema,
    query,
    validationRules: [validationRule],
    operationName: 'TestQuery',
  });

  expect(errors).toBeNull();
});
