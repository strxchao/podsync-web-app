import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import GoogleSheetEntry from '../models/GoogleSheetEntry.js';

dotenv.config();

async function fixDatabaseTimezone() {
  console.log('=== Fixing Database Timezone for Local Time ===\n');

  try {
    // 1. Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // 2. Set session timezone to local/system
    console.log('\n1. Setting database session timezone...');
    try {
      await sequelize.query("SET time_zone = SYSTEM");
      console.log('✓ Session timezone set to SYSTEM');
    } catch (error) {
      console.log('⚠️ Could not set session timezone:', error.message);
      console.log('Continuing with current timezone...');
    }

    // 3. Check current timezone settings
    console.log('\n2. Checking timezone settings...');
    const [timezoneInfo] = await sequelize.query('SELECT @@time_zone as session_tz, @@system_time_zone as system_tz, NOW() as current_time');
    const tzInfo = timezoneInfo[0];
    console.log(`Session timezone: ${tzInfo.session_tz}`);
    console.log(`System timezone: ${tzInfo.system_tz}`);
    console.log(`Current database time: ${tzInfo.current_time}`);

    // 4. Check existing data format
    console.log('\n3. Checking existing data...');
    try {
      const sampleCount = await GoogleSheetEntry.count();
      console.log(`Total records in google_sheet_entries: ${sampleCount}`);

      if (sampleCount > 0) {
        // Get sample records to check format
        const sampleRecords = await GoogleSheetEntry.findAll({
          limit: 3,
          order: [['id', 'ASC']],
          raw: true
        });

        console.log('\nSample records (showing timestamp format):');
        sampleRecords.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}`);
          console.log(`     Raw timestamp: ${record.timestamp}`);
          console.log(`     Name: ${record.nama_lengkap}`);
          console.log(`     Date: ${record.tanggal_mulai_peminjaman}`);
          console.log();
        });

        // Test reading with current configuration
        console.log('4. Testing current data reading...');
        const latestRecord = await GoogleSheetEntry.findOne({
          order: [['timestamp', 'DESC']]
        });

        if (latestRecord) {
          console.log('Latest record timestamp processing:');
          console.log(`  Database value: ${latestRecord.timestamp}`);
          console.log(`  JavaScript Date: ${latestRecord.timestamp.toString()}`);
          console.log(`  Local string: ${latestRecord.timestamp.toLocaleString()}`);
          console.log(`  ISO string: ${latestRecord.timestamp.toISOString()}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not check existing data:', error.message);
    }

    // 5. Test insertion with current time
    console.log('\n5. Testing new data insertion...');
    const testTimestamp = new Date();
    const testData = {
      version: 1,
      timestamp: testTimestamp,
      nama_lengkap: 'TIMEZONE_TEST_USER',
      nip_kode_dosen_nim: 'TEST_TZ_001',
      no_telepon_mobile: '081234567890',
      unit_prodi: 'Test Unit',
      keperluan_peminjaman: 'Testing timezone fix',
      jenis_fasilitas_dipinjam: 'Test Facility',
      tanggal_mulai_peminjaman: testTimestamp.toISOString().split('T')[0],
      tanggal_selesai_peminjaman: testTimestamp.toISOString().split('T')[0],
      bulan_peminjaman: testTimestamp.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      jam_mulai: testTimestamp.toTimeString().slice(0, 5),
      jam_berakhir: testTimestamp.toTimeString().slice(0, 5),
      jumlah_jam: 1
    };

    console.log(`Inserting test record with timestamp: ${testTimestamp.toLocaleString()}`);
    
    // Clean up any existing test record
    await GoogleSheetEntry.destroy({
      where: { nip_kode_dosen_nim: 'TEST_TZ_001' },
      force: true
    });

    // Insert test record
    const insertedRecord = await GoogleSheetEntry.create(testData);
    console.log(`✓ Test record inserted with ID: ${insertedRecord.id}`);

    // Retrieve and verify
    const retrievedRecord = await GoogleSheetEntry.findByPk(insertedRecord.id);
    console.log('\nVerification:');
    console.log(`  Original timestamp: ${testTimestamp.toLocaleString()}`);
    console.log(`  Retrieved timestamp: ${retrievedRecord.timestamp.toLocaleString()}`);
    console.log(`  Times match: ${Math.abs(testTimestamp.getTime() - retrievedRecord.timestamp.getTime()) < 1000 ? 'YES ✓' : 'NO ✗'}`);

    // Clean up test record
    await GoogleSheetEntry.destroy({
      where: { id: insertedRecord.id },
      force: true
    });
    console.log('✓ Test record cleaned up');

    // 6. Recommendations
    console.log('\n6. RECOMMENDATIONS:');
    
    if (tzInfo.session_tz === 'SYSTEM' || tzInfo.session_tz.includes('+07:00')) {
      console.log('✓ Database timezone is correctly set for local time');
    } else {
      console.log('⚠️ Database timezone should be set to SYSTEM or +07:00 for WIB');
      console.log('💡 Add this to your MySQL configuration:');
      console.log('   default-time-zone = "+07:00"');
      console.log('   OR run: SET GLOBAL time_zone = "+07:00"');
    }

    console.log('\n=== Timezone Fix Completed ===');

  } catch (error) {
    console.error('Error fixing database timezone:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabaseTimezone().catch(error => {
    console.error('Timezone fix failed:', error);
    process.exit(1);
  });
}

export default fixDatabaseTimezone;