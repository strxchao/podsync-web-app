import { syncDatabase } from '../../models/index.js';
import { testConnection, sequelize } from '../../config/database.js';

async function initializeDatabase() {
  try {
    console.log('Starting PodSync database initialization...');
    
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      console.error('');
      console.error('Troubleshooting steps:');
      console.error('1. Check if MySQL/MariaDB is running');
      console.error('2. Verify database credentials in .env file');
      console.error('3. Ensure database "podsync_db" exists');
      console.error('4. Check if port 3306 is accessible');
      process.exit(1);
    }

    console.log('Database connection established successfully.');

    // Check for existing tables that might cause foreign key issues
    try {
      console.log('Checking for existing tables...');
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${process.env.DB_NAME || 'podsync_db'}'
        AND table_name IN ('schedules', 'broadcast_statuses', 'signage_contents', 'google_sheet_entries')
      `);
      
      if (tables.length > 0) {
        console.log(`Found ${tables.length} existing PodSync tables`);
        console.log('These will be recreated (all data will be lost)');
        
        // Drop tables manually in correct order to avoid foreign key constraints
        await dropTablesInOrder();
      } else {
        console.log('No existing tables found - proceeding with fresh installation');
      }
    } catch (error) {
      console.log('Could not check existing tables - proceeding anyway');
    }

    // Sync database with force: true to recreate tables
    console.log('Starting database synchronization...');
    await syncDatabaseSafely();
    
    console.log('');
    console.log('Database initialization completed successfully!');
    console.log('All tables created with proper relationships');
    console.log('Initial data seeded');
    console.log('Ready to start the server!');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('Error initializing database:', error.message);
    
    // Provide specific troubleshooting based on error type
    if (error.code === 'ER_FK_CANNOT_DROP_PARENT') {
      console.error('');
      console.error('Foreign key constraint detected. Solutions:');
      console.error('1. Run this script again (it should handle it automatically)');
      console.error('2. Or manually drop all tables first:');
      console.error('   DROP TABLE IF EXISTS broadcast_statuses;');
      console.error('   DROP TABLE IF EXISTS schedules;');
      console.error('   DROP TABLE IF EXISTS signage_contents;');
      console.error('   DROP TABLE IF EXISTS google_sheet_entries;');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('');
      console.error('Database connection issue - check your .env file');
    }
    
    process.exit(1);
  }
}

async function dropTablesInOrder() {
  try {
    console.log('Dropping existing tables in correct order...');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Drop tables in order (child tables first, then parent tables)
    const tablesToDrop = [
      'broadcast_statuses',  // Has FK to schedules
      'schedules',          // Has FK to google_sheet_entries  
      'signage_contents',   // No FK dependencies
      'google_sheet_entries' // Parent table
    ];
    
    for (const table of tablesToDrop) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS \`${table}\`;`);
        console.log(`  Dropped table: ${table}`);
      } catch (error) {
        console.log(`  Could not drop table ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('Existing tables dropped successfully');
    
  } catch (error) {
    console.error('Error dropping tables:', error.message);
    // Continue anyway - syncDatabase might still work
  }
}

async function syncDatabaseSafely() {
  try {
    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('Foreign key checks disabled');
    
    // Sync database with force: true to recreate tables
    await syncDatabase(true);
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Foreign key checks re-enabled');
    
    console.log('Database models synced successfully');
    
  } catch (error) {
    console.error('Error during database sync:', error);
    
    // Always try to re-enable foreign key checks
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('Foreign key checks re-enabled after error');
    } catch (fkError) {
      console.error('Could not re-enable foreign key checks:', fkError.message);
    }
    
    throw error;
  }
}

// Handle script interruption gracefully
process.on('SIGINT', async () => {
  console.log('\nDatabase initialization interrupted...');
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    await sequelize.close();
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(1);
});

// Run the initialization
initializeDatabase();