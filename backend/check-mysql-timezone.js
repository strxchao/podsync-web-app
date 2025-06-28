import dotenv from 'dotenv';
import { sequelize } from './src/config/database.js';

dotenv.config();

async function checkMySQLTimezone() {
  console.log('=== MySQL Timezone Check ===\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL database\n');

    // 1. Check current timezone settings
    console.log('1. CURRENT TIMEZONE SETTINGS:');
    const [timezoneResults] = await sequelize.query(`
      SELECT 
        @@global.time_zone as global_timezone,
        @@session.time_zone as session_timezone,
        @@system_time_zone as system_timezone,
        NOW() as current_time,
        UTC_TIMESTAMP() as utc_time,
        CONVERT_TZ(NOW(), @@session.time_zone, '+00:00') as converted_utc
    `);
    
    const tz = timezoneResults[0];
    console.log(`Global timezone: ${tz.global_timezone}`);
    console.log(`Session timezone: ${tz.session_timezone}`);
    console.log(`System timezone: ${tz.system_timezone}`);
    console.log(`Current database time: ${tz.current_time}`);
    console.log(`UTC time: ${tz.utc_time}`);
    console.log(`Converted to UTC: ${tz.converted_utc}`);
    
    // 2. Compare with JavaScript time
    console.log('\n2. COMPARISON WITH JAVASCRIPT:');
    const jsNow = new Date();
    console.log(`JavaScript local time: ${jsNow.toLocaleString()}`);
    console.log(`JavaScript UTC time: ${jsNow.toISOString()}`);
    console.log(`JavaScript timezone offset: ${jsNow.getTimezoneOffset()} minutes`);
    
    // 3. Check if times match
    console.log('\n3. TIME SYNCHRONIZATION CHECK:');
    const dbTime = new Date(tz.current_time);
    const timeDiff = Math.abs(jsNow.getTime() - dbTime.getTime());
    console.log(`Database time: ${dbTime.toLocaleString()}`);
    console.log(`Time difference: ${timeDiff}ms`);
    console.log(`Times are synchronized: ${timeDiff < 60000 ? 'YES ✓' : 'NO ✗'}`);
    
    // 4. Check what timezone should be
    console.log('\n4. TIMEZONE RECOMMENDATIONS:');
    if (jsNow.getTimezoneOffset() === -420) {
      console.log('✓ System is set to WIB/Jakarta timezone (+7)');
      
      if (tz.session_timezone === '+07:00' || tz.session_timezone === 'Asia/Jakarta') {
        console.log('✓ Database session timezone is correctly set to +07:00');
      } else {
        console.log('⚠️ Database session timezone should be set to +07:00');
        console.log('Current session timezone:', tz.session_timezone);
      }
      
      if (tz.global_timezone === '+07:00' || tz.global_timezone === 'Asia/Jakarta') {
        console.log('✓ Database global timezone is correctly set to +07:00');
      } else {
        console.log('⚠️ Database global timezone should be set to +07:00');
        console.log('Current global timezone:', tz.global_timezone);
      }
    } else {
      console.log('⚠️ System timezone is not WIB/Jakarta');
      console.log(`Current system offset: ${jsNow.getTimezoneOffset()} minutes`);
      console.log('WIB should be: -420 minutes');
    }

    console.log('\n=== Check Complete ===');

  } catch (error) {
    console.error('Error checking MySQL timezone:', error);
  } finally {
    await sequelize.close();
  }
}

checkMySQLTimezone();