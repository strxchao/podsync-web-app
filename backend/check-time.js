import dotenv from 'dotenv';
import { sequelize } from './src/config/database.js';
import GoogleSheetEntry from './src/models/GoogleSheetEntry.js';

dotenv.config();

async function checkProjectTime() {
  console.log('=== PODSYNC TIME CHECKER ===\n');
  
  // 1. System Time
  console.log('1. SYSTEM TIME:');
  const now = new Date();
  console.log('   JavaScript Date():', now.toString());
  console.log('   Local String:', now.toLocaleString());
  console.log('   WIB Format:', now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
  console.log('   ISO String (UTC):', now.toISOString());
  console.log('   Date Only:', now.toLocaleDateString('sv-SE')); // YYYY-MM-DD format
  console.log('   Time Only:', now.toLocaleTimeString());
  console.log();

  // 2. Database Time (if available)
  console.log('2. DATABASE TIME:');
  try {
    await sequelize.authenticate();
    console.log('   ✓ Database connected');
    
    // Check database timezone
    const [timezoneResult] = await sequelize.query('SELECT @@time_zone as db_timezone, NOW() as db_now, UTC_TIMESTAMP() as db_utc');
    const dbInfo = timezoneResult[0];
    
    console.log('   Database timezone:', dbInfo.db_timezone);
    console.log('   Database NOW():', dbInfo.db_now);
    console.log('   Database UTC_TIMESTAMP():', dbInfo.db_utc);
    
    // Check if there's any data in google_sheet_entries
    try {
      const entryCount = await GoogleSheetEntry.count();
      console.log(`   Records in google_sheet_entries: ${entryCount}`);
      
      if (entryCount > 0) {
        const latestEntry = await GoogleSheetEntry.findOne({
          order: [['timestamp', 'DESC']],
          limit: 1
        });
        
        if (latestEntry) {
          console.log('   Latest entry timestamp:', latestEntry.timestamp);
          console.log('   Latest entry created_at:', latestEntry.created_at);
          console.log('   Latest entry date:', latestEntry.tanggal_mulai_peminjaman);
        }
      }
    } catch (error) {
      console.log('   ⚠️ Could not fetch sample data:', error.message);
    }
    
  } catch (error) {
    console.log('   ✗ Database not available:', error.message);
  }
  console.log();

  // 3. Google Sheets Timestamp Parsing Test
  console.log('3. GOOGLE SHEETS PARSING TEST:');
  const testTimestamps = [
    '22/06/2025 02:30:44',
    '21/06/2025 19:52:57',
    getCurrentTimeInGoogleSheetsFormat()
  ];
  
  testTimestamps.forEach((timestamp, index) => {
    console.log(`   Test ${index + 1}: ${timestamp}`);
    try {
      const parsed = parseGoogleSheetsTimestamp(timestamp);
      console.log('     Parsed as:', parsed.toString());
      console.log('     Local format:', parsed.toLocaleString());
      console.log('     MySQL format:', formatForMySQL(parsed));
    } catch (error) {
      console.log('     Error:', error.message);
    }
    console.log();
  });

  // 4. Time Zone Comparison
  console.log('4. TIMEZONE COMPARISON:');
  const currentTime = new Date();
  const timezones = [
    { name: 'Local System', format: currentTime.toLocaleString() },
    { name: 'WIB (Asia/Jakarta)', format: currentTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) },
    { name: 'UTC', format: currentTime.toLocaleString('en-US', { timeZone: 'UTC' }) },
    { name: 'ISO String', format: currentTime.toISOString() }
  ];
  
  timezones.forEach(tz => {
    console.log(`   ${tz.name.padEnd(20)}: ${tz.format}`);
  });
  console.log();

  // 5. Recommendations
  console.log('5. RECOMMENDATIONS:');
  const systemOffset = now.getTimezoneOffset();
  const wibOffset = -420; // WIB is UTC+7 = -420 minutes
  
  if (systemOffset === wibOffset) {
    console.log('   ✓ System timezone matches WIB (+7)');
  } else {
    console.log(`   ⚠️ System timezone offset: ${systemOffset} minutes`);
    console.log(`   ⚠️ WIB should be: ${wibOffset} minutes`);
    console.log('   💡 Consider setting system timezone to Asia/Jakarta');
  }
  
  console.log();
  console.log('=== TIME CHECK COMPLETE ===');
  
  try {
    await sequelize.close();
  } catch (error) {
    // Ignore close errors
  }
  
  process.exit(0);
}

// Helper functions
function parseGoogleSheetsTimestamp(timestampStr) {
  const [datePart, timePart] = timestampStr.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function formatForMySQL(date) {
  // Format for MySQL storage in local time
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getCurrentTimeInGoogleSheetsFormat() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Run the check
checkProjectTime().catch(error => {
  console.error('Time check failed:', error);
  process.exit(1);
});