import { PrimaryKey, Model, Table, Column } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

@Table({
  tableName: 'Person',
})
class Person extends Model<Person> {
  @PrimaryKey
  @Column({
    type: DataTypes.INTEGER,
    comment: 'Unique identifier',
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataTypes.TEXT,
    comment: 'First name of the person',
  })
  declare firstName: string;
}

export default Person;