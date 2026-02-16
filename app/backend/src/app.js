import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import compression from 'compression';
import ApiError from './utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';
import { errorHandlingMiddleware } from './middlewares/errorHandling.middleware.js';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('public/uploads'));

// API Routes
app.use('/api', routes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GreenLife Store API' });
});

// Handle 404 Not Found
app.use((req, res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, 'Not Found'));
});

// Global Error Handling Middleware
app.use(errorHandlingMiddleware);

export default app;
