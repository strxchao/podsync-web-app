import { Sequelize } from 'sequelize';

// Custom error class for API errors
export class APIError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Error logging function
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      status: err.status || 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    }
  };

  console.error('Error occurred:', JSON.stringify(errorLog, null, 2));
};

// Central error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req);

  // Handle Sequelize errors
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      error: 'Conflict Error',
      message: 'A record with this unique field already exists',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    return res.status(400).json({
      error: 'Foreign Key Constraint Error',
      message: 'Referenced record does not exist',
      details: {
        field: err.fields,
        table: err.table
      }
    });
  }

  // Handle Google Sheets API errors
  if (err.code === 403) {
    return res.status(403).json({
      error: 'Google Sheets API Error',
      message: 'Access denied to Google Sheets. Please check your credentials.',
      details: err.message
    });
  }

  if (err.code === 404) {
    return res.status(404).json({
      error: 'Google Sheets API Error',
      message: 'Spreadsheet not found. Please check your spreadsheet ID.',
      details: err.message
    });
  }

  // Handle custom API errors
  if (err instanceof APIError) {
    return res.status(err.status).json({
      error: err.name,
      message: err.message,
      details: err.details
    });
  }

  // Handle all other errors
  const status = err.status || 500;
  const message = status === 500 
    ? 'Internal Server Error'
    : err.message;

  res.status(status).json({
    error: err.name || 'Error',
    message: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 404 handler middleware
export const notFoundHandler = (req, res) => {
  const error = {
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    details: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query
    }
  };

  console.log('404 Not Found:', JSON.stringify(error, null, 2));
  res.status(404).json(error);
};

// Async handler wrapper to catch promise rejections
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
