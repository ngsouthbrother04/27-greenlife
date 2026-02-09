import { StatusCodes } from 'http-status-codes';

/**
 * Global error handling middleware for Express applications
 */
// eslint-disable-next-line no-unused-vars
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Default failure configuration
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  // Create response error object
  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode], // Standard message if none provided
    stack: err.stack
  };

  // Do not return stack trace in production environment
  // console.log(process.env.BUILD_MODE) // Should be 'production' or 'dev'
  if (process.env.BUILD_MODE !== 'dev') delete responseError.stack;

  // Send response
  res.status(responseError.statusCode).json(responseError);
};
