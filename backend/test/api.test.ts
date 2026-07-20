import request from 'supertest';

import app from '../src/app';

describe('GET /v1', () => {
  it('responds with a json message', async () => {
    await request(app)
      .get('/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'Root API response',
      });
  });
});
