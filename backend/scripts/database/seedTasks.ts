import sequelize from '../../src/database';
import Task from '../../src/database/models/task.model';

const sampleTasks = [
  { title: 'Set up project', description: 'Clone boilerplates and get the stack running', completed: true },
  { title: 'Design the Task model', description: 'title, description, completed', completed: true },
  { title: 'Build the API', description: 'POST/GET/PATCH/DELETE /tasks', completed: true },
  { title: 'Build the UI', description: 'Add, view, toggle, delete tasks', completed: false },
  { title: 'Write API validation', description: 'Reject empty titles and unknown fields', completed: true },
  { title: 'Write API error handling', description: 'Consistent error response shape across routes', completed: false },
  { title: 'Add pagination to GET /tasks', description: 'Support page and pageSize query params', completed: false },
  { title: 'Add search to GET /tasks', description: 'Filter by title/description substring match', completed: false },
  { title: 'Write backend tests', description: 'Cover happy path and validation/404 edge cases', completed: false },
  { title: 'Write frontend tests', description: 'Cover the task list and form components', completed: false },
  { title: 'Style the task list', description: 'Bootstrap layout for the task list and form', completed: false },
  { title: 'Add empty state', description: 'Show a message when there are no tasks', completed: false },
  { title: 'Add loading state', description: 'Disable the form while a request is in flight', completed: false },
  { title: 'Add error banner', description: 'Surface failed requests to the user', completed: false },
  { title: 'Review docker-compose setup', description: 'Confirm hot reload works for both services', completed: true },
  { title: 'Document environment variables', description: 'Explain .env and .env.sample in the README', completed: true },
  { title: 'Set up dedicated db user', description: 'Create api_user instead of using postgres superuser', completed: true },
  { title: 'Fix stale gitlink entries', description: 'Remove leftover submodule references for backend/frontend', completed: true },
  { title: 'Write root README', description: 'Explain how to run the whole stack', completed: true },
  { title: 'Add optional seed script', description: 'Populate sample tasks for manual testing', completed: true },
  { title: 'Plan small commits', description: 'Split remaining work into reviewable PRs', completed: false },
  { title: 'Open PR for task API', description: 'Request review before merging to master', completed: false },
  { title: 'Open PR for task UI', description: 'Request review before merging to master', completed: false },
  { title: 'Buy groceries', description: 'Milk, eggs, bread, coffee', completed: false },
  { title: 'Schedule dentist appointment', description: 'Call before end of month', completed: false },
  { title: 'Plan weekend trip', description: 'Look into camping spots nearby', completed: false },
  { title: 'Read a book', description: 'Finish the one on the nightstand', completed: true },
  { title: 'Clean the garage', description: 'Donate anything unused in the last year', completed: false },
];

async function seed() {
  await Task.bulkCreate(sampleTasks)
    .catch(error => console.error(error))
    .finally(async () => {
      await sequelize.close();
      console.log(`Task seed complete (${sampleTasks.length} tasks)`);
    });
}

seed();
