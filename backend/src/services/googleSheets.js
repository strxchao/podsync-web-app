import { google } from 'googleapis';
import dotenv from 'dotenv';
import GoogleSheetEntry from '../models/GoogleSheetEntry.js';
import { parseGoogleSheetsTimestamp, formatForMySQL, formatWIBDisplay } from '../utils/timezone.js';

dotenv.config();

class GoogleSheetsService {
  constructor() {
    this.sheetName = 'Form Responses 1';
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.initialized) return;

      console.log('Initializing Google Sheets service...');
      
      // Check required environment variables
      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
      const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
      
      if (!clientEmail || !privateKey || !spreadsheetId) {
        throw new Error('Missing Google Sheets credentials. Required: GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID');
      }
      
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.spreadsheetId = spreadsheetId;
      
      await this.verifyConnection();
      
      this.initialized = true;
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      
      console.log(`Connected to spreadsheet: ${response.data.properties.title}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Google Sheets:', error);
      throw error;
    }
  }

  parseDate(dateStr) {
    // Convert "15 Januari 2025" to "2025-01-15"
    const months = {
      'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
      'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
      'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    };

    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = parts[2];

    if (!month) {
      throw new Error(`Invalid month in date: ${dateStr}`);
    }

    return `${year}-${month}-${day}`;
  }

  parseTimestamp(timestampStr) {
    // Use centralized timezone parser
    const localDate = parseGoogleSheetsTimestamp(timestampStr);
    
    if (localDate) {
      console.log(`Parsed timestamp: ${timestampStr} -> Local: ${formatWIBDisplay(localDate)}`);
      console.log(`Will be stored as: ${formatForMySQL(localDate)}`);
    }
    
    return localDate;
  }

  formatForDatabase(date) {
    // Use centralized MySQL formatter
    return formatForMySQL(date);
  }

  async fetchAndSyncData() {
    try {
      await this.initialize();

      console.log(`Fetching data from sheet: ${this.sheetName}`);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2:N`, // Skip header row
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('No data found in spreadsheet');
        return {
          processed: 0,
          updated: 0,
          created: 0,
          errors: 0
        };
      }

      console.log(`Found ${rows.length} rows of data`);

      const stats = {
        processed: rows.length,
        updated: 0,
        created: 0,
        errors: 0
      };

      // Process each row
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

          const entry = {
            timestamp: this.parseTimestamp(timestamp),
            nama_lengkap: namaLengkap,
            nip_kode_dosen_nim: nipKodeDosenNim,
            no_telepon_mobile: noTeleponMobile,
            unit_prodi: unitProdi,
            keperluan_peminjaman: keperluanPeminjaman,
            jenis_fasilitas_dipinjam: jenisFasilitas,
            tanggal_mulai_peminjaman: this.parseDate(tanggalMulai),
            tanggal_selesai_peminjaman: this.parseDate(tanggalSelesai),
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
            console.log(`Updated entry for ${entry.nama_lengkap}`);
          } else {
            await GoogleSheetEntry.create(entry);
            stats.created++;
            console.log(`Created new entry for ${entry.nama_lengkap}`);
          }
        } catch (error) {
          console.error('Error processing row:', error);
          stats.errors++;
        }
      }

      console.log('Sync completed with statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error during data sync:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;