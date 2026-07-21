import request from 'supertest';
import sequelize from '../../src/database';

import app from '../../src/app';

const TaskModel = sequelize.models.Task;

async function createTask(overrides: { title?: string; description?: string | null; completed?: boolean } = {}) {
  return TaskModel.create({
    title: 'Sample task',
    description: 'Sample description',
    completed: false,
    ...overrides,
  });
}

beforeEach(async () => {
  await TaskModel.destroy({ truncate: true, restartIdentity: true });
});

describe('GET /v1/tasks', () => {
  it('returns paginated tasks', async () => {
    await createTask({ title: 'First' });
    await createTask({ title: 'Second' });

    const response = await request(app).get('/v1/tasks').expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('filters by search across title and description', async () => {
    await createTask({ title: 'Buy milk', description: 'from the store' });
    await createTask({ title: 'Walk the dog', description: 'around the block' });

    const response = await request(app).get('/v1/tasks?search=milk').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Buy milk');
  });

  it('filters by status', async () => {
    await createTask({ title: 'Done', completed: true });
    await createTask({ title: 'Not done', completed: false });

    const response = await request(app).get('/v1/tasks?status=completed').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Done');
  });

  it('rejects an invalid status value', async () => {
    const response = await request(app).get('/v1/tasks?status=bogus').expect(400);

    expect(response.body.message).toMatch(/status must be/);
  });

  it('defaults page and pageSize when omitted', async () => {
    const response = await request(app).get('/v1/tasks').expect(200);

    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.pageSize).toBe(10);
  });

  it('rejects an unparseable page', async () => {
    const response = await request(app).get('/v1/tasks?page=abc').expect(400);

    expect(response.body.message).toMatch(/positive integers/);
  });

  it('rejects page 0', async () => {
    const response = await request(app).get('/v1/tasks?page=0').expect(400);

    expect(response.body.message).toMatch(/positive integers/);
  });

  it('rejects a fractional page', async () => {
    const response = await request(app).get('/v1/tasks?page=1.5').expect(400);

    expect(response.body.message).toMatch(/positive integers/);
  });

  it('paginates according to page and pageSize', async () => {
    await createTask({ title: 'Task 1' });
    await createTask({ title: 'Task 2' });
    await createTask({ title: 'Task 3' });

    const response = await request(app).get('/v1/tasks?page=1&pageSize=2').expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination.totalPages).toBe(2);
  });
});

describe('POST /v1/tasks', () => {
  it('creates a task with a trimmed title and description', async () => {
    const response = await request(app)
      .post('/v1/tasks')
      .send({ title: '  New task  ', description: '  details  ' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      title: 'New task',
      description: 'details',
      completed: false,
    });
  });

  it('defaults description to null when omitted', async () => {
    const response = await request(app)
      .post('/v1/tasks')
      .send({ title: 'No description' })
      .expect(201);

    expect(response.body.data.description).toBeNull();
  });

  it('rejects an empty title', async () => {
    const response = await request(app).post('/v1/tasks').send({ title: '   ' }).expect(400);

    expect(response.body.message).toMatch(/title is required/);
  });

  it('rejects a missing title', async () => {
    const response = await request(app).post('/v1/tasks').send({}).expect(400);

    expect(response.body.message).toMatch(/title is required/);
  });

  it('rejects a non-string description', async () => {
    const response = await request(app)
      .post('/v1/tasks')
      .send({ title: 'Valid', description: 123 })
      .expect(400);

    expect(response.body.message).toMatch(/description must be a string/);
  });
});

describe('PATCH /v1/tasks/:id', () => {
  it('updates title and description', async () => {
    const task = await createTask({ title: 'Old title' });

    const response = await request(app)
      .patch(`/v1/tasks/${task.get('id')}`)
      .send({ title: 'New title', description: 'New description' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      title: 'New title',
      description: 'New description',
    });
  });

  it('updates completed status only', async () => {
    const task = await createTask({ completed: false });

    const response = await request(app)
      .patch(`/v1/tasks/${task.get('id')}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.data.completed).toBe(true);
  });

  it('returns 404 for a missing task', async () => {
    const response = await request(app)
      .patch('/v1/tasks/999999')
      .send({ completed: true })
      .expect(404);

    expect(response.body.message).toMatch(/not found/);
  });

  it('returns 400 for a non-integer id', async () => {
    const response = await request(app).patch('/v1/tasks/abc').send({ completed: true }).expect(400);

    expect(response.body.message).toMatch(/id must be an integer/);
  });

  it('returns 400 when no fields are provided', async () => {
    const task = await createTask();

    const response = await request(app).patch(`/v1/tasks/${task.get('id')}`).send({}).expect(400);

    expect(response.body.message).toMatch(/at least one of/);
  });

  it('returns 400 for an empty title', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/v1/tasks/${task.get('id')}`)
      .send({ title: '' })
      .expect(400);

    expect(response.body.message).toMatch(/non-empty string/);
  });
});

describe('PATCH /v1/tasks/bulk', () => {
  it('marks multiple tasks as complete', async () => {
    const first = await createTask({ completed: false });
    const second = await createTask({ completed: false });

    const response = await request(app)
      .patch('/v1/tasks/bulk')
      .send({ ids: [first.get('id'), second.get('id')], completed: true })
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((task: { completed: boolean }) => task.completed)).toBe(true);
  });

  it('rejects an empty ids array', async () => {
    const response = await request(app)
      .patch('/v1/tasks/bulk')
      .send({ ids: [], completed: true })
      .expect(400);

    expect(response.body.message).toMatch(/non-empty array/);
  });

  it('rejects a missing completed value', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch('/v1/tasks/bulk')
      .send({ ids: [task.get('id')] })
      .expect(400);

    expect(response.body.message).toMatch(/completed is required/);
  });
});

describe('DELETE /v1/tasks/:id', () => {
  it('deletes an existing task', async () => {
    const task = await createTask();

    await request(app).delete(`/v1/tasks/${task.get('id')}`).expect(204);

    const found = await TaskModel.findByPk(task.get('id') as number);

    expect(found).toBeNull();
  });

  it('returns 404 for a missing task', async () => {
    const response = await request(app).delete('/v1/tasks/999999').expect(404);

    expect(response.body.message).toMatch(/not found/);
  });

  it('returns 400 for a non-integer id', async () => {
    const response = await request(app).delete('/v1/tasks/abc').expect(400);

    expect(response.body.message).toMatch(/id must be an integer/);
  });
});
