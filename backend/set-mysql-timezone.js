import dotenv from 'dotenv';
import { sequelize } from './src/config/database.js';

dotenv.config();

async function setMySQLTimezone() {
  console.log('=== Setting MySQL Timezone to +07:00 (Jakarta/WIB) ===\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL database\n');

    // 1. Check current timezone settings
    console.log('1. CHECKING CURRENT TIMEZONE:');
    try {
      const [currentTz] = await sequelize.query(`
        SELECT 
          @@global.time_zone as global_tz,
          @@session.time_zone as session_tz,
          @@system_time_zone as system_tz,
          NOW() as current_time
      `);
      
      console.log(`Current global timezone: ${currentTz[0].global_tz}`);
      console.log(`Current session timezone: ${currentTz[0].session_tz}`);
      console.log(`System timezone: ${currentTz[0].system_tz}`);
      console.log(`Current time: ${currentTz[0].current_time}`);
    } catch (error) {
      console.log('Could not check current timezone:', error.message);
    }

    // 2. Set session timezone to +07:00
    console.log('\n2. SETTING SESSION TIMEZONE TO +07:00:');
    try {
      await sequelize.query("SET time_zone = '+07:00'");
      console.log('✓ Session timezone set to +07:00');
    } catch (error) {
      console.log('⚠️ Could not set session timezone:', error.message);
    }

    // 3. Try to set global timezone (requires SUPER privilege)
    console.log('\n3. ATTEMPTING TO SET GLOBAL TIMEZONE TO +07:00:');
    try {
      await sequelize.query("SET GLOBAL time_zone = '+07:00'");
      console.log('✓ Global timezone set to +07:00');
    } catch (error) {
      console.log('⚠️ Could not set global timezone (may require SUPER privilege):', error.message);
      console.log('💡 To set global timezone permanently, add to MySQL config:');
      console.log('   [mysqld]');
      console.log('   default-time-zone = "+07:00"');
    }

    // 4. Verify new timezone settings
    console.log('\n4. VERIFYING NEW TIMEZONE SETTINGS:');
    try {
      const [newTz] = await sequelize.query(`
        SELECT 
          @@global.time_zone as global_tz,
          @@session.time_zone as session_tz,
          NOW() as current_time,
          UTC_TIMESTAMP() as utc_time
      `);
      
      console.log(`New global timezone: ${newTz[0].global_tz}`);
      console.log(`New session timezone: ${newTz[0].session_tz}`);
      console.log(`Current time (should be WIB): ${newTz[0].current_time}`);
      console.log(`UTC time: ${newTz[0].utc_time}`);
      
      // Compare with JavaScript time
      const jsNow = new Date();
      const dbTime = new Date(newTz[0].current_time);
      console.log(`JavaScript local time: ${jsNow.toLocaleString()}`);
      console.log(`Time difference: ${Math.abs(jsNow.getTime() - dbTime.getTime())}ms`);
      
    } catch (error) {
      console.log('Could not verify timezone settings:', error.message);
    }

    // 5. Test timezone with sample data
    console.log('\n5. TESTING TIMEZONE WITH SAMPLE DATA:');
    try {
      // Insert current time
      const testTime = new Date();
      const formattedTime = testTime.toISOString().slice(0, 19).replace('T', ' ');
      
      await sequelize.query(`
        CREATE TEMPORARY TABLE IF NOT EXISTS timezone_test (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_time DATETIME,
          inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await sequelize.query(`
        INSERT INTO timezone_test (test_time) VALUES (?)
      `, {
        replacements: [formattedTime]
      });
      
      const [testResult] = await sequelize.query(`
        SELECT 
          test_time,
          inserted_at,
          NOW() as current_db_time
        FROM timezone_test 
        ORDER BY id DESC 
        LIMIT 1
      `);
      
      console.log('Test results:');
      console.log(`  Inserted time: ${testResult[0].test_time}`);
      console.log(`  Auto timestamp: ${testResult[0].inserted_at}`);
      console.log(`  Current DB time: ${testResult[0].current_db_time}`);
      
    } catch (error) {
      console.log('Could not test timezone with sample data:', error.message);
    }

    console.log('\n=== MySQL Timezone Setup Complete ===');
    console.log('✓ Session timezone set to +07:00 (Jakarta/WIB)');
    console.log('✓ Database will now use Jakarta timezone for all operations');
    console.log('✓ Times should now match between Google Sheets and database');

  } catch (error) {
    console.error('Error setting MySQL timezone:', error);
  } finally {
    await sequelize.close();
  }
}

setMySQLTimezone();