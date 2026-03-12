import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandlingMiddleware } from '../middlewares/errorHandling.middleware.js';
import { StatusCodes } from 'http-status-codes';

describe('Error Handling Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    // Khôi phục process.env mặc định và ẩn console.error
    vi.stubEnv('BUILD_MODE', 'dev');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should default to 500 INTERNAL_SERVER_ERROR if no statusCode is provided', () => {
    const error = new Error('Test internal error');
    
    errorHandlingMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Test internal error',
      stack: error.stack
    });
  });

  it('should use provided statusCode and message', () => {
    const error = new Error('Custom Error');
    error.statusCode = StatusCodes.BAD_REQUEST;
    
    errorHandlingMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Custom Error',
      stack: error.stack
    });
  });

  it('should handle Prisma Unique Constraint Violation (P2002)', () => {
    const error = new Error('Prisma error');
    error.code = 'P2002';
    
    errorHandlingMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.CONFLICT,
      message: 'Email already exists',
      stack: error.stack
    });
  });

  it('should omit stack trace if BUILD_MODE is not dev', () => {
    vi.stubEnv('BUILD_MODE', 'production');
    const error = new Error('Prod Error');
    error.statusCode = StatusCodes.BAD_REQUEST;
    
    errorHandlingMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Prod Error'
    });
    // Check stack is omitted
    const calledWith = res.json.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty('stack');
  });
});
