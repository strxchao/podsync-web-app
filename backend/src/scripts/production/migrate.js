import { sequelize } from '../config/database.js';
import { testConnection } from '../config/database.js';

const migrations = [
  {
    name: 'add_media_url_field',
    sql: `ALTER TABLE signage_content ADD COLUMN IF NOT EXISTS media_url TEXT NULL AFTER type`
  },
  {
    name: 'add_qr_code_field', 
    sql: `ALTER TABLE signage_content ADD COLUMN IF NOT EXISTS qr_code_url TEXT NULL AFTER media_url`
  },
  {
    name: 'add_input_date_field',
    sql: `ALTER TABLE signage_content ADD COLUMN IF NOT EXISTS input_date DATE DEFAULT (CURDATE()) AFTER end_date`
  }
];

async function runMigrations() {
  for (const migration of migrations) {
    try {
      await sequelize.query(migration.sql);
      console.log(`Migration completed: ${migration.name}`);
    } catch (error) {
      console.log(`Migration skipped: ${migration.name} - ${error.message}`);
    }
  }
}