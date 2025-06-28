import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { TIMEOUTS } from './timeouts.js';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'podsync_db',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: TIMEOUTS.DATABASE_CONNECTION,
    idle: 5000,
    evict: 1000,
    handleDisconnects: true
  },
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: function (field, next) {
      // Handle DATETIME fields to preserve local time format
      if (field.type === 'DATETIME') {
        const value = field.string();
        if (value) {
          // Parse MySQL datetime as local time (not UTC)
          const parts = value.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
          if (parts) {
            const [, year, month, day, hours, minutes, seconds] = parts;
            // Create date in local timezone
            return new Date(year, month - 1, day, hours, minutes, seconds);
          }
        }
        return value;
      }
      return next();
    },
    timezone: 'local'
  },
  timezone: 'local'
};

// Create Sequelize instance
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions
  }
);

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Log database information
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log('Database version:', results[0].version);
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Handle connection events
sequelize.addHook('beforeConnect', async (config) => {
  console.log(`Attempting to connect to database '${config.database}' on ${config.host}...`);
});

sequelize.addHook('afterConnect', async (connection) => {
  console.log('Successfully connected to database.');
  
  // Timezone setting moved to be optional and non-blocking
  setTimeout(async () => {
    try {
      await sequelize.query("SET time_zone = '+07:00'", { timeout: TIMEOUTS.DATABASE_TIMEZONE_SETUP });
      console.log('✓ Database timezone set to +07:00 (Jakarta/WIB)');
    } catch (error) {
      console.warn('⚠️ Could not set database timezone to +07:00:', error.message);
    }
  }, 100);
});

// Export configuration for use in other files
export const config = dbConfig;

export default {
  sequelize,
  testConnection,
  config
};
