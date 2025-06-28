import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
import GoogleSheetEntry from './GoogleSheetEntry.js';
import SignageContent from './SignageContent.js';
import BroadcastStatus from './BroadcastStatus.js';
import Schedule from './Schedule.js';

// Define all models
const models = {
  GoogleSheetEntry,
  SignageContent,
  BroadcastStatus,
  Schedule
};

// FIXED: Set up associations with proper error handling - SINGLE PLACE ONLY
try {
  console.log('Setting up model associations...');
  
  // BroadcastStatus belongs to Schedule (optional relationship)
  BroadcastStatus.belongsTo(Schedule, {
    foreignKey: {
      name: 'schedule_id',
      allowNull: true
    },
    as: 'schedule',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Schedule.hasMany(BroadcastStatus, {
    foreignKey: 'schedule_id',
    as: 'broadcastStatuses'
  });

  // Schedule can be created from GoogleSheetEntry - SINGLE DEFINITION
  Schedule.belongsTo(GoogleSheetEntry, {
    foreignKey: {
      name: 'google_sheet_entry_id',
      allowNull: true
    },
    as: 'googleSheetEntry',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  GoogleSheetEntry.hasMany(Schedule, {
    foreignKey: 'google_sheet_entry_id',
    as: 'schedules'
  });

  console.log('Model associations established successfully');
} catch (error) {
  console.error('Error setting up model associations:', error);
}

// CRITICAL: Export Op so other files can use it
export { Op };

// Sync database function with better error handling
export async function syncDatabase(force = false) {
  try {
    console.log('Starting database sync...');
    
    if (force) {
      console.log('Force sync enabled - will recreate all tables');
      
      // Disable foreign key checks for MySQL
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      console.log('Foreign key checks disabled');
    }
    
    // Sync all models - let Sequelize handle the order
    await sequelize.sync({ 
      force, 
      alter: !force,
      logging: console.log // Enable logging to see what's happening
    });
    
    if (force) {
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('Foreign key checks re-enabled');
      
      // Seed initial data
      await seedInitialData();
    }
    
    console.log('Database models synced successfully');
    
  } catch (error) {
    console.error('Error syncing database:', error);
    
    // Always try to re-enable foreign key checks in case of error
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('Foreign key checks re-enabled after error');
    } catch (fkError) {
      console.error('Error re-enabling foreign key checks:', fkError);
    }
    
    throw error;
  }
}

// Seed initial data function
async function seedInitialData() {
  try {
    console.log('Seeding initial data...');
    
    // Add default broadcast status (without schedule reference initially)
    const existingStatus = await BroadcastStatus.findOne();
    if (!existingStatus) {
      await BroadcastStatus.create({
        isOnAir: false,
        statusMessage: 'System initialized - Off Air',
        updatedBy: 'system'
      });
      console.log('Default broadcast status created');
    }
    
    // Add sample signage content
    const existingContent = await SignageContent.findOne();
    if (!existingContent) {
      await SignageContent.create({
        title: 'Welcome to PodSync',
        description: 'Digital Signage System for Multimedia Studio',
        type: 'announcement',
        is_active: true,
        display_order: 1,
        created_by: 'system'
      });
      
      await SignageContent.create({
        title: 'Current Schedule',
        description: 'Check today\'s lab booking schedule',
        type: 'schedule',
        is_active: true,
        display_order: 2,
        created_by: 'system'
      });
      
      console.log('Sample signage content created');
    }
    
    console.log('Initial data seeding completed');
    
  } catch (error) {
    console.error('Error seeding initial data:', error);
    // Don't throw error here, just log it
  }
}

export { sequelize };
export default models;