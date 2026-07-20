import sequelize from '../../src/database';
import Task from '../../src/database/models/task.model';

const sampleTasks = [
  { title: 'Set up project', description: 'Clone boilerplates and get the stack running', completed: true },
  { title: 'Design the Task model', description: 'title, description, completed', completed: true },
  { title: 'Build the API', description: 'POST/GET/PATCH/DELETE /tasks', completed: false },
  { title: 'Build the UI', description: 'Add, view, toggle, delete tasks', completed: false },
];

async function seed() {
  await Task.bulkCreate(sampleTasks)
    .catch(error => console.error(error))
    .finally(async () => {
      await sequelize.close();
      console.log('Task seed complete');
    });
}

seed();
