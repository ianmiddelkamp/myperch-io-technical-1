import sequelize from '../../src/database';

afterAll(async () => {
  await sequelize.close();
});