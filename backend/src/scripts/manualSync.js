import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import googleSheetsService from '../services/googleSheets.js';
import GoogleSheetEntry from '../models/GoogleSheetEntry.js';

dotenv.config();

function parseTimestamp(timestampStr) {
  try {
    if (!timestampStr) return null;

    // Convert "13/01/2025 13:57:45" to JavaScript Date using local time
    const [datePart, timePart] = timestampStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');
    
    // Create date object directly using local time (no timezone conversion)
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    
    console.log(`Parsed timestamp: ${timestampStr} -> Local: ${date.toLocaleString()}`);
    console.log(`Database format: ${formatForDatabase(date)}`);
    
    return date;
  } catch (error) {
    console.error(`Error parsing timestamp '${timestampStr}':`, error);
    return null;
  }
}

function formatForDatabase(date) {
  // Format date for MySQL storage in local time format
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function parseDate(dateStr) {
  try {
    if (!dateStr) return null;

    // Handle date format "DD/MM/YYYY"
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(part => part.trim());
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Handle date format "DD Month YYYY" (e.g., "15 Januari 2025")
    const months = {
      'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
      'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
      'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    };

    const parts = dateStr.toLowerCase().trim().split(' ');
    if (parts.length === 3) {
      const [day, monthName, year] = parts;
      const month = months[monthName];
      if (day && month && year) {
        return `${year}-${month}-${day.padStart(2, '0')}`;
      }
    }

    console.warn(`Unsupported date format: ${dateStr}`);
    return null;
  } catch (error) {
    console.error(`Error parsing date '${dateStr}':`, error);
    return null;
  }
}

export async function manualSync() {
  console.log('Starting manual synchronization...\n');

  try {
    // Initialize connections
    console.log('1. Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    console.log('2. Initializing Google Sheets service...');
    await googleSheetsService.initialize();
    console.log('✓ Google Sheets service initialized\n');

    // Fetch data from Google Sheets
    console.log('3. Fetching data from Google Sheets...');
    const response = await googleSheetsService.sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Form Responses 1!A2:N'
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('! No data found in spreadsheet');
      process.exit(0);
    }

    console.log(`✓ Found ${rows.length} rows of data\n`);

    // Process rows
    console.log('4. Processing and syncing data...');
    const stats = {
      total: rows.length,
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      skipped: 0
    };

    for (const row of rows) {
      try {
        const [
          timestamp,
          namaLengkap,
          nipKodeDosenNim,
          noTeleponMobile,
          unitProdi,
          keperluanPeminjaman,
          jenisFasilitas,
          tanggalMulai,
          tanggalSelesai,
          bulanPeminjaman,
          jamMulai,
          jamBerakhir,
          jumlahJam
        ] = row;

        // Skip if required fields are missing
        if (!timestamp || !namaLengkap || !nipKodeDosenNim || !tanggalMulai || !tanggalSelesai) {
          console.log(`Skipping row: Missing required fields`);
          stats.skipped++;
          continue;
        }

        const parsedTimestamp = parseTimestamp(timestamp);
        if (!parsedTimestamp) {
          console.log(`Skipping row: Invalid timestamp format - ${timestamp}`);
          stats.skipped++;
          continue;
        }

        const parsedTanggalMulai = parseDate(tanggalMulai);
        const parsedTanggalSelesai = parseDate(tanggalSelesai);

        if (!parsedTanggalMulai || !parsedTanggalSelesai) {
          console.log(`Skipping row: Invalid date format - Start: ${tanggalMulai}, End: ${tanggalSelesai}`);
          stats.skipped++;
          continue;
        }

        const entry = {
          timestamp: parsedTimestamp,
          nama_lengkap: namaLengkap,
          nip_kode_dosen_nim: nipKodeDosenNim,
          no_telepon_mobile: noTeleponMobile,
          unit_prodi: unitProdi,
          keperluan_peminjaman: keperluanPeminjaman,
          jenis_fasilitas_dipinjam: jenisFasilitas,
          tanggal_mulai_peminjaman: parsedTanggalMulai,
          tanggal_selesai_peminjaman: parsedTanggalSelesai,
          bulan_peminjaman: bulanPeminjaman,
          jam_mulai: jamMulai,
          jam_berakhir: jamBerakhir,
          jumlah_jam: parseInt(jumlahJam) || 0
        };

        // Try to find existing entry
        const existingEntry = await GoogleSheetEntry.findOne({
          where: {
            timestamp: entry.timestamp,
            nip_kode_dosen_nim: entry.nip_kode_dosen_nim
          }
        });

        if (existingEntry) {
          await existingEntry.update(entry);
          stats.updated++;
          process.stdout.write('↑'); // Update indicator
        } else {
          await GoogleSheetEntry.create(entry);
          stats.created++;
          process.stdout.write('→'); // Create indicator
        }

        stats.processed++;

        // Show progress every 10 rows
        if (stats.processed % 10 === 0) {
          process.stdout.write(`\n[${stats.processed}/${stats.total}] `);
        }
      } catch (error) {
        console.error('\nError processing row:', error);
        stats.errors++;
        process.stdout.write('✗'); // Error indicator
      }
    }

    // Final statistics
    console.log('\n\nSync completed!');
    console.log('Statistics:');
    console.log(`- Total rows: ${stats.total}`);
    console.log(`- Processed: ${stats.processed}`);
    console.log(`- Created: ${stats.created}`);
    console.log(`- Updated: ${stats.updated}`);
    console.log(`- Skipped: ${stats.skipped}`);
    console.log(`- Errors: ${stats.errors}`);

    process.exit(0);
  } catch (error) {
    console.error('\nSync failed:', error);
    process.exit(1);
  }
}

// Run the sync if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  manualSync().catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
}
