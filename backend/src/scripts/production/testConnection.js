import dotenv from 'dotenv';
import { sequelize } from '../../config/database.js';
import googleSheetsService from '../../services/googleSheets.js';
import GoogleSheetEntry from '../../models/GoogleSheetEntry.js';

dotenv.config();

async function testConnections() {
  console.log('Testing connections...\n');

  // Test database connection
  try {
    console.log('1. Testing MySQL connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');
    
    // Test table existence
    await GoogleSheetEntry.describe();
    console.log('✓ Table "google_sheet_entries" exists and is properly configured');
    
    // Get table info
    const [results] = await sequelize.query('SHOW COLUMNS FROM google_sheet_entries');
    console.log('\nTable structure:');
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }

  // Test Google Sheets connection
  try {
    console.log('\n2. Testing Google Sheets connection...');
    await googleSheetsService.initialize();
    console.log('✓ Google Sheets authentication successful');
    
    // Test data fetch
    console.log('\nAttempting to fetch first row of data...');
    const response = await googleSheetsService.sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Form Responses 1!A2:N2'
    });

    if (response.data.values && response.data.values.length > 0) {
      console.log('✓ Successfully retrieved data from spreadsheet');
      console.log('\nSample data (first row):');
      const headers = [
        'Timestamp', 'Nama Lengkap', 'NIP/Kode Dosen/NIM', 'No. Telepon/Mobile',
        'Univ/Prodi', 'Keperluan Peminjaman', 'Jenis fasilitas', 
        'Tanggal Mulai', 'Tanggal Selesai', 'Bulan', 'Jam Mulai',
        'Jam Berakhir', 'Jumlah Jam'
      ];
      response.data.values[0].forEach((value, index) => {
        console.log(`- ${headers[index]}: ${value}`);
      });
    } else {
      console.log('! Spreadsheet is empty or has no data in the specified range');
    }
  } catch (error) {
    console.error('✗ Google Sheets connection failed:', error.message);
    if (error.message.includes('credentials')) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Verify your service account credentials are correct');
      console.log('2. Make sure the service account has access to the spreadsheet');
      console.log('3. Check if the spreadsheet ID is correct');
    }
    process.exit(1);
  }

  console.log('\nAll connection tests completed successfully!');
  process.exit(0);
}

testConnections().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
