import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middleware from './middlewares';
import api from './api';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Response from server',
  });
});

app.use('/v1', api);

app.use(middleware.notFound);
app.use(middleware.errorHandler);

export default app;
