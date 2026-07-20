import sequelize from '../../src/database';

async function sync() {
  await sequelize.sync({ force: true })
    .catch(error => (console.error(error)))
    .finally(async () => {
      await sequelize.close();
      console.log('Database sync complete');
    });
}

sync();
