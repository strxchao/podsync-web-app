// Test timezone handling between Google Sheets and Database
import googleSheetsService from '../../services/googleSheets.js';
import GoogleSheetEntry from '../../models/GoogleSheetEntry.js';
import { sequelize } from '../../config/database.js';

async function testTimezoneHandling() {
  try {
    console.log('Testing timezone handling...\n');
    
    // 1. Test database timezone configuration
    console.log('1. Database Timezone Configuration:');
    const [timezoneResult] = await sequelize.query('SELECT @@time_zone as db_timezone, NOW() as db_now, UTC_TIMESTAMP() as db_utc');
    console.log('Database timezone:', timezoneResult[0].db_timezone);
    console.log('Database NOW():', timezoneResult[0].db_now);
    console.log('Database UTC_TIMESTAMP():', timezoneResult[0].db_utc);
    
    // 2. Test local timezone
    console.log('\n2. Local Timezone Information:');
    const now = new Date();
    console.log('System timezone offset (minutes):', now.getTimezoneOffset());
    console.log('Current local time:', now.toLocaleString());
    console.log('Current UTC time:', now.toISOString());
    console.log('Current WIB time:', now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    
    // 3. Test timestamp parsing
    console.log('\n3. Timestamp Parsing Test:');
    const testTimestamps = [
      '22/06/2025 02:30:44',
      '21/06/2025 19:52:57',
      '06/06/2025 11:43:55'
    ];
    
    for (const testTimestamp of testTimestamps) {
      console.log(`\nTesting: ${testTimestamp}`);
      try {
        const parsedDate = googleSheetsService.parseTimestamp(testTimestamp);
        console.log('  Parsed Date object:', parsedDate);
        console.log('  ISO string:', parsedDate.toISOString());
        console.log('  WIB format:', parsedDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
        console.log('  UTC format:', parsedDate.toLocaleString('en-US', { timeZone: 'UTC' }));
      } catch (error) {
        console.log('  Error parsing:', error.message);
      }
    }
    
    // 4. Test database insertion and retrieval
    console.log('\n4. Database Insert/Retrieve Test:');
    const testEntry = {
      version: 1,
      timestamp: googleSheetsService.parseTimestamp('22/06/2025 02:30:44'),
      nama_lengkap: 'Test User Timezone',
      nip_kode_dosen_nim: 'TEST_TIMEZONE_001',
      no_telepon_mobile: '081234567890',
      unit_prodi: 'Test Unit',
      keperluan_peminjaman: 'Test timezone handling',
      jenis_fasilitas_dipinjam: 'Test Facility',
      tanggal_mulai_peminjaman: '2025-06-22',
      tanggal_selesai_peminjaman: '2025-06-22',
      bulan_peminjaman: 'Juni 2025',
      jam_mulai: '02:30',
      jam_berakhir: '03:30',
      jumlah_jam: 1
    };
    
    // Clean up any existing test entry
    await GoogleSheetEntry.destroy({
      where: { nip_kode_dosen_nim: 'TEST_TIMEZONE_001' },
      force: true
    });
    
    // Insert test entry
    const insertedEntry = await GoogleSheetEntry.create(testEntry);
    console.log('Inserted entry ID:', insertedEntry.id);
    console.log('Inserted timestamp (from DB):', insertedEntry.timestamp);
    console.log('Inserted timestamp formatted:', insertedEntry.timestamp.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    
    // Retrieve and verify
    const retrievedEntry = await GoogleSheetEntry.findOne({
      where: { nip_kode_dosen_nim: 'TEST_TIMEZONE_001' }
    });
    
    if (retrievedEntry) {
      console.log('\nRetrieved entry:');
      console.log('Retrieved timestamp (from DB):', retrievedEntry.timestamp);
      console.log('Retrieved timestamp formatted:', retrievedEntry.timestamp.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
      console.log('Original vs Retrieved match:', 
        testEntry.timestamp.toISOString() === retrievedEntry.timestamp.toISOString() ? 'YES' : 'NO'
      );
    }
    
    // 5. Test date comparison methods
    console.log('\n5. Date Comparison Methods Test:');
    const todayWIB = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
    console.log('Today in WIB (YYYY-MM-DD):', todayWIB);
    
    // Update test entry to today's date
    await retrievedEntry.update({
      tanggal_mulai_peminjaman: todayWIB,
      tanggal_selesai_peminjaman: todayWIB
    });
    
    await retrievedEntry.reload();
    console.log('isToday() method:', retrievedEntry.isToday());
    console.log('isActive() method:', retrievedEntry.isActive());
    
    // Clean up
    await GoogleSheetEntry.destroy({
      where: { nip_kode_dosen_nim: 'TEST_TIMEZONE_001' },
      force: true
    });
    
    console.log('\nTimezone test completed successfully!');
    
  } catch (error) {
    console.error('Error in timezone test:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTimezoneHandling().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export default testTimezoneHandling;