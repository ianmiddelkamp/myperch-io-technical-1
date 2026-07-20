import {
  PrimaryKey, Model, Table, Column, Default, AllowNull,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

@Table({
  tableName: 'Task',
})
class Task extends Model<Task> {
  @PrimaryKey
  @Column({
    type: DataTypes.INTEGER,
    comment: 'Unique identifier',
    autoIncrement: true,
  })
  declare id: number;

  @AllowNull(false)
  @Column({
    type: DataTypes.TEXT,
    comment: 'Title of the task',
  })
  declare title: string;

  @Column({
    type: DataTypes.TEXT,
    comment: 'Description of the task',
  })
  declare description: string | null;

  @Default(false)
  @Column({
    type: DataTypes.BOOLEAN,
    comment: 'Whether the task has been completed',
  })
  declare completed: boolean;
}

export default Task;
