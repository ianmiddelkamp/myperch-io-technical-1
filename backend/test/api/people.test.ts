import request from 'supertest';
import sequelize from '../../src/database';

import app from '../../src/app';

describe('GET /v1/people', () => {
  it('responds with a list of people', async () => {
    const people = await sequelize.models.Person.findAll();

    const expectedResponse = {
      data: people,
    };

    const response = await request(app).get('/v1/people')
      .expect(200);

    expect(response.body).toEqual(expectedResponse);
  });
});
