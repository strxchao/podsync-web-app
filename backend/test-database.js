import { sequelize } from './src/config/database.js';
import GoogleSheetEntry from './src/models/GoogleSheetEntry.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('DB Host:', process.env.DB_HOST || 'localhost');
    console.log('DB Name:', process.env.DB_NAME || 'podsync_db');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Get database version
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log('MySQL Version:', results[0].version);
    
    // Test table existence
    try {
      await sequelize.query('DESCRIBE google_sheet_entries');
      console.log('Table google_sheet_entries exists');
    } catch (tableError) {
      console.error('Table google_sheet_entries does not exist');
      console.log('Creating table...');
      await GoogleSheetEntry.sync({ force: false });
      console.log('Table created successfully');
    }
    
    // Check total records
    const totalRecords = await GoogleSheetEntry.count();
    console.log(`Total records in table: ${totalRecords}`);
    
    // Check records without soft delete
    const activeRecords = await GoogleSheetEntry.count({
      where: { deleted_at: null }
    });
    console.log(`Active records (not deleted): ${activeRecords}`);
    
    if (totalRecords === 0) {
      console.log('Database is empty - inserting sample data...');
      await insertSampleData();
      
      // Recount after insertion
      const newTotal = await GoogleSheetEntry.count();
      console.log(`Sample data inserted. New total: ${newTotal}`);
    } else {
      // Show sample data
      const sampleData = await GoogleSheetEntry.findAll({
        limit: 5,
        order: [['created_at', 'DESC']]
      });
      
      console.log(`Sample records (showing ${sampleData.length}):`);
      sampleData.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.nama_lengkap} | ${record.tanggal_mulai_peminjaman} | ${record.jenis_fasilitas_dipinjam} | ${record.jumlah_jam}h`);
      });
    }
    
    // Test date range query (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    console.log(`Testing date range query: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const recentRecords = await GoogleSheetEntry.count({
      where: {
        tanggal_mulai_peminjaman: {
          [sequelize.Op.between]: [startDate, endDate]
        },
        deleted_at: null
      }
    });
    
    console.log(`Records in last 30 days: ${recentRecords}`);
    
    // Test facility breakdown
    const facilityBreakdown = await sequelize.query(`
      SELECT 
        jenis_fasilitas_dipinjam as facility,
        COUNT(*) as count,
        SUM(jumlah_jam) as total_hours
      FROM google_sheet_entries 
      WHERE deleted_at IS NULL 
        AND jenis_fasilitas_dipinjam IS NOT NULL
      GROUP BY jenis_fasilitas_dipinjam
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Facility usage breakdown:');
    facilityBreakdown.forEach(facility => {
      console.log(`  - ${facility.facility}: ${facility.count} sessions, ${facility.total_hours}h`);
    });
    
    // Test unit breakdown
    const unitBreakdown = await sequelize.query(`
      SELECT 
        unit_prodi as unit,
        COUNT(*) as count,
        COUNT(DISTINCT nip_kode_dosen_nim) as unique_users
      FROM google_sheet_entries 
      WHERE deleted_at IS NULL 
        AND unit_prodi IS NOT NULL
      GROUP BY unit_prodi
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Unit/Prodi usage breakdown:');
    unitBreakdown.forEach(unit => {
      console.log(`  - ${unit.unit}: ${unit.count} sessions, ${unit.unique_users} users`);
    });
    
    console.log('\nDatabase test completed successfully!');
    console.log('You can now restart your application to see the data in charts.');
    
  } catch (error) {
    console.error('Database test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code || 'Unknown'
    });
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Fix: Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Fix: Make sure MySQL server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('Fix: Database "podsync_db" does not exist. Create it first.');
    }
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

async function insertSampleData() {
  try {
    // Generate data for the last week
    const today = new Date();
    const sampleEntries = [];
    
    const facilities = ['Studio Podcast', 'Ruang Meeting', 'Lab Multimedia', 'Ruang Konferensi'];
    const units = ['Teknik Informatika', 'Sistem Informasi', 'Multimedia', 'Teknik Komputer'];
    const names = [
      'Dr. Ahmad Suryanto',
      'Prof. Siti Rahayu', 
      'Drs. Budi Santoso',
      'Dr. Maya Sari',
      'Prof. Andi Wijaya',
      'Dr. Rina Kartika',
      'Drs. Joko Susilo',
      'Dr. Lisa Permata'
    ];
    const purposes = [
      'Recording podcast pembelajaran',
      'Webinar teknologi terbaru',
      'Praktikum multimedia',
      'Rapat koordinasi',
      'Seminar online',
      'Workshop teknologi',
      'Pelatihan software',
      'Diskusi penelitian'
    ];
    
    // Create 15 sample entries for the last week
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 7); // Random day in last week
      const entryDate = new Date(today);
      entryDate.setDate(entryDate.getDate() - daysAgo);
      
      const startHour = 8 + Math.floor(Math.random() * 10); // 8-17
      const duration = 1 + Math.floor(Math.random() * 4); // 1-4 hours
      const endHour = startHour + duration;
      
      const entry = {
        version: 1,
        timestamp: new Date(),
        nama_lengkap: names[Math.floor(Math.random() * names.length)],
        nip_kode_dosen_nim: `${1970 + Math.floor(Math.random() * 30)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        no_telepon_mobile: `0812${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        unit_prodi: units[Math.floor(Math.random() * units.length)],
        keperluan_peminjaman: purposes[Math.floor(Math.random() * purposes.length)],
        jenis_fasilitas_dipinjam: facilities[Math.floor(Math.random() * facilities.length)],
        tanggal_mulai_peminjaman: entryDate.toISOString().split('T')[0],
        tanggal_selesai_peminjaman: entryDate.toISOString().split('T')[0],
        bulan_peminjaman: entryDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        jam_mulai: `${startHour.toString().padStart(2, '0')}:00`,
        jam_berakhir: `${endHour.toString().padStart(2, '0')}:00`,
        jumlah_jam: duration
      };
      
      sampleEntries.push(entry);
    }
    
    await GoogleSheetEntry.bulkCreate(sampleEntries);
    console.log(`${sampleEntries.length} sample entries inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase();
}