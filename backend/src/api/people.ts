import express from 'express';
import sequelize from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  const people = await sequelize.models.Person.findAll();

  res.json({
    data: people,
  });
});

export default router;
