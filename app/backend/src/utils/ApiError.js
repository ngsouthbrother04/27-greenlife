/**
 * Defines a custom ApiError class that extends the built-in Error class.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    // Call the constructor of the parent class (Error)
    super(message);

    // Name of the error class
    this.name = 'ApiError';

    // Custom HTTP status code
    this.statusCode = statusCode;

    // Capture the stack trace (V8 specific)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
