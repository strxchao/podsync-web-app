// Centralized timeout configuration

export const TIMEOUTS = {
  // Database timeouts
  DATABASE_CONNECTION: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 3000,
  DATABASE_QUERY: parseInt(process.env.DB_QUERY_TIMEOUT) || 2000,
  DATABASE_TIMEZONE_SETUP: parseInt(process.env.DB_TIMEZONE_TIMEOUT) || 1000,
  
  // API timeouts
  API_REQUEST: parseInt(process.env.API_TIMEOUT) || 15000,
  API_HEALTH_CHECK: parseInt(process.env.API_HEALTH_TIMEOUT) || 5000,
  
  // Google Sheets timeouts
  GOOGLE_SHEETS_AUTH: parseInt(process.env.GOOGLE_SHEETS_TIMEOUT) || 10000,
  GOOGLE_SHEETS_QUERY: parseInt(process.env.GOOGLE_SHEETS_QUERY_TIMEOUT) || 8000,
  
  // Sync timeouts
  SYNC_OPERATION: parseInt(process.env.SYNC_TIMEOUT) || 30000,
  SYNC_LOCK: parseInt(process.env.SYNC_LOCK_TIMEOUT) || 60000,
  
  // Server timeouts
  SERVER_STARTUP: parseInt(process.env.SERVER_STARTUP_TIMEOUT) || 10000,
  SERVER_SHUTDOWN: parseInt(process.env.SERVER_SHUTDOWN_TIMEOUT) || 5000,
  
  // External service timeouts
  QR_CODE_GENERATION: parseInt(process.env.QR_CODE_TIMEOUT) || 5000,
  
  // Frontend timeouts (for reference)
  FRONTEND_API_TIMEOUT: parseInt(process.env.FRONTEND_API_TIMEOUT) || 15000,
  FRONTEND_RETRY_TIMEOUT: parseInt(process.env.FRONTEND_RETRY_TIMEOUT) || 1000
};

// Timeout utilities
export const createTimeoutPromise = (timeoutMs, message = 'Operation timeout') => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error(message)), timeoutMs)
  );
};

export const withTimeout = async (promise, timeoutMs, message = 'Operation timeout') => {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs, message)
  ]);
};

export default TIMEOUTS;