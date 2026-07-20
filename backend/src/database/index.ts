import { Sequelize } from 'sequelize-typescript';
import databaseConfig from '../config/database.config';

const sequelize = new Sequelize(databaseConfig);

export default sequelize;
