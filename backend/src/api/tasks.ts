import express, { NextFunction, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import sequelize from '../database';
import TaskModel from '../database/models/task.model';
import Task from '../interfaces/Task';
import { CrudResponse, GetPaginatedResponse } from '../interfaces/CrudResponse';
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

router.post('/', async (req, res: Response<CrudResponse<Task> | ErrorResponse>, next: NextFunction) => {
  const { title, description } = req.body;

  const trimmedTitle = typeof title === 'string' ? title.trim() : '';

  if (trimmedTitle.length === 0) {
    res.status(400).json({ message: 'title is required and must be a non-empty string' });
    return;
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ message: 'description must be a string' });
    return;
  }

  try {
    const task = await sequelize.models.Task.create({
      title: trimmedTitle,
      description: typeof description === 'string' ? description.trim() : null,
    });

    res.status(201).json({ data: task as unknown as Task });
  } catch (error) {
    next(error);
  } 
});

router.patch('/:id', async (req, res: Response<CrudResponse<Task> | ErrorResponse>, next: NextFunction) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'id must be an integer' });
    return;
  }

  const { title, description, completed } = req.body;

  const updates: { title?: string; description?: string | null; completed?: boolean } = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ message: 'title must be a non-empty string' });
      return;
    }

    updates.title = title.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') {
      res.status(400).json({ message: 'description must be a string' });
      return;
    }

    updates.description = typeof description === 'string' ? description.trim() : null;
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      res.status(400).json({ message: 'completed must be a boolean' });
      return;
    }

    updates.completed = completed;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: 'at least one of title, description, completed must be provided' });
    return;
  }

  try {
    const task = await sequelize.models.Task.findByPk(id);

    if (!task) {
      res.status(404).json({ message: `Task ${id} not found` });
      return;
    }

    await task.update(updates);

    res.json({ data: task as unknown as Task });
  } catch (error) {
    next(error);
  }
});

export default router;
