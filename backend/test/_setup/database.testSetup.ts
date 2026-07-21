import sequelize from '../../src/database';

// Tests truncate tables between cases (see tasks.test.ts's beforeEach). If
// DB_DATABASE isn't overridden to the test database — e.g. someone runs
// `docker compose exec api npm test` instead of `npm run test:docker` — this
// would silently wipe the dev database instead. Fail fast instead.
const databaseName = sequelize.getDatabaseName();

if (!databaseName.endsWith('-test')) {
  throw new Error(
    `Refusing to run tests against database "${databaseName}" — expected a database `
    + 'name ending in "-test". Did you mean to run `npm run test:docker` (or set '
    + 'DB_DATABASE to the test database) instead?',
  );
}

afterAll(async () => {
  await sequelize.close();
});