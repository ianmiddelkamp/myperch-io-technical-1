import express, { NextFunction, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import TaskModel from '../database/models/task.model';
import Task from '../interfaces/Task';
import { GetPaginatedResponse } from '../interfaces/CrudResponse';
import ErrorResponse from '../interfaces/ErrorResponse';

const router = express.Router();

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

router.get('/', async (req, res: Response<GetPaginatedResponse<Task> | ErrorResponse>, next: NextFunction) => {
  const page: number = Number(req.query.page) || 1;
  const requestedPageSize: number = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const pageSize: number = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  if (!Number.isInteger(page) || !Number.isInteger(pageSize) || page < 1 || pageSize < 1) {
    res.status(400).json({ message: 'page and pageSize must be positive integers' });
    return;
  }

  const { search, status } = req.query;

  if (status !== undefined && status !== 'completed' && status !== 'incomplete') {
    res.status(400).json({ message: "status must be 'completed' or 'incomplete'" });
    return;
  }

  const conditions: WhereOptions[] = [];

  if (typeof search === 'string' && search.trim().length > 0) {
    conditions.push({
      [Op.or]: [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ],
    });
  }

  if (status === 'completed' || status === 'incomplete') {
    conditions.push({ completed: status === 'completed' });
  }

  const where: WhereOptions | undefined = conditions.length > 0 ? { [Op.and]: conditions } : undefined;

  try {
    const { rows: tasks, count: total } = await TaskModel.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const response: GetPaginatedResponse<Task> = {
      data: tasks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
