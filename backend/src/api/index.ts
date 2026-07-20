import express from 'express';

import peopleRouter from './people';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Root API response',
  });
});

router.use('/people', peopleRouter);

export default router;
