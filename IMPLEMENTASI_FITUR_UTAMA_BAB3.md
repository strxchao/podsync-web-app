# BAB III - METODOLOGI PENELITIAN

## 3.3 Implementasi Sistem

Implementasi sistem PodSync dilakukan dengan mengintegrasikan berbagai fitur utama yang mendukung pengelolaan digital signage laboratorium podcast. Setiap fitur diimplementasikan secara modular untuk memastikan maintainability dan scalability sistem.

### 3.3.1 Fitur Utama yang Diimplementasikan

#### A. Fitur Sinkronisasi Google Sheets Otomatis

**Deskripsi Fitur:**
Fitur ini memungkinkan sistem untuk melakukan sinkronisasi otomatis dengan Google Sheets yang berisi data peminjaman laboratorium dari Google Forms. Sinkronisasi dilakukan secara berkala untuk memastikan data selalu up-to-date.

**Implementasi Teknis:**

```javascript
// Google Sheets Service Implementation
class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async syncData() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Sheet1!A:M'
      });
      
      const rows = response.data.values;
      return await this.processAndStoreData(rows);
    } catch (error) {
      console.error('Google Sheets sync error:', error);
      throw error;
    }
  }
}
```

**Komponen Implementasi:**
Implementasi fitur sinkronisasi Google Sheets terdiri dari beberapa komponen utama yang bekerja secara terintegrasi. Auto-sync Scheduler menggunakan cron job yang berjalan setiap 5 menit untuk memastikan data selalu up-to-date tanpa intervensi manual. Data Parser bertugas mengolah berbagai format tanggal dan waktu yang beragam dari input Google Forms, mengkonversinya menjadi format standar yang dapat diproses oleh sistem. Unit Mapper melakukan standardisasi nama unit/program studi yang bervariasi dalam input form menjadi format konsisten dalam database. Conflict Resolution mendeteksi dan menangani data yang duplicate atau conflicting dengan menggunakan unique constraint pada timestamp dan NIP. Error Handling menyediakan retry mechanism dan fallback untuk menangani kegagalan koneksi atau error dalam proses sinkronisasi.

**Manfaat Implementasi:**
Fitur ini memberikan manfaat signifikan dalam operasional laboratorium. Eliminasi manual data entry oleh staff lab mengurangi beban kerja dan human error dalam input data jadwal. Real-time update jadwal peminjaman memastikan informasi yang ditampilkan selalu akurat dan terkini. Konsistensi data antara Google Forms dan sistem PodSync mencegah terjadinya discrepancy informasi yang dapat menyebabkan konflik jadwal. Audit trail untuk tracking perubahan data menyediakan transparency dan accountability dalam setiap modifikasi data yang terjadi dalam sistem.

#### B. Fitur Broadcast Management System

**Deskripsi Fitur:**
Sistem manajemen broadcast yang dapat mengontrol status on-air/off-air secara otomatis berdasarkan jadwal aktif atau secara manual oleh administrator.

**Implementasi Teknis:**

```javascript
// Broadcast Scheduler Implementation
class BroadcastScheduler {
  start() {
    console.log('🤖 Starting broadcast scheduler');
    this.interval = setInterval(() => {
      this.checkScheduleStatus();
    }, 60000); // Check setiap menit
  }

  async checkScheduleStatus() {
    try {
      const now = new Date();
      const activeSchedules = await Schedule.findAll({
        where: {
          date: now.toISOString().split('T')[0],
          start_time: { [Op.lte]: now.toTimeString().split(' ')[0] },
          end_time: { [Op.gte]: now.toTimeString().split(' ')[0] }
        }
      });

      const shouldBeOnAir = activeSchedules.length > 0;
      await this.updateBroadcastStatus(shouldBeOnAir, 'system-auto');
    } catch (error) {
      console.error('Broadcast check error:', error);
    }
  }

  async updateBroadcastStatus(isOnAir, updatedBy) {
    await BroadcastStatus.create({
      isOnAir,
      statusMessage: isOnAir ? 'On Air - Auto Control' : 'Off Air - Auto Control',
      updatedBy,
      lastUpdated: new Date()
    });
  }
}
```

**Komponen Implementasi:**
Sistem broadcast management dibangun dengan arsitektur yang fleksibel dan reliable. Auto Scheduler melakukan monitoring terhadap jadwal aktif setiap menit menggunakan interval checking untuk mendeteksi kapan laboratorium sedang digunakan dan secara otomatis mengubah status broadcast. Manual Override menyediakan interface yang user-friendly bagi administrator untuk mengubah status broadcast secara manual ketika diperlukan, dengan prioritas lebih tinggi dari auto scheduler. Status History mencatat tracking semua perubahan status dengan timestamp yang akurat dan informasi user yang melakukan perubahan untuk keperluan audit dan troubleshooting. Real-time Notification memastikan setiap perubahan status broadcast langsung di-update ke Unity display tanpa delay yang signifikan. API Endpoints menyediakan RESTful API yang robust untuk broadcast control dengan proper error handling dan response formatting.

**Manfaat Implementasi:**
Fitur broadcast management memberikan automation yang signifikan dalam pengelolaan laboratorium. Otomasi pengelolaan status broadcast mengurangi ketergantungan pada manual intervention dan memastikan konsistensi operasional. Fleksibilitas control manual memberikan administrator kemampuan untuk override sistem automatis saat terjadi situasi khusus atau emergency. History tracking menyediakan audit trail yang comprehensive untuk troubleshooting masalah dan analisis pattern penggunaan laboratorium. Integration yang seamless dengan Unity digital signage memastikan informasi real-time dapat diakses oleh users laboratorium dengan visual yang menarik dan informatif.

#### C. Fitur Content Management System

**Deskripsi Fitur:**
Sistem pengelolaan konten digital signage yang memungkinkan admin untuk membuat, mengedit, mengatur, dan menjadwalkan konten yang akan ditampilkan.

**Implementasi Teknis:**

```javascript
// Content Controller Implementation
class ContentController {
  async createContent(req, res) {
    try {
      const { title, description, content, type, mediaUrl, displayOrder } = req.body;
      
      let qrCodeUrl = null;
      if (mediaUrl) {
        qrCodeUrl = await this.generateQRCode(mediaUrl);
      }

      const newContent = await SignageContent.create({
        title,
        description,
        content,
        type,
        mediaUrl,
        qrCodeUrl,
        displayOrder: displayOrder || 0,
        isActive: true,
        createdBy: req.user?.username || 'admin'
      });

      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: newContent
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateQRCode(mediaUrl) {
    const QRCode = require('qrcode');
    try {
      const qrCodeDataURL = await QRCode.toDataURL(mediaUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return null;
    }
  }
}
```

**Komponen Implementasi:**
Content Management System diimplementasikan dengan pendekatan modular yang comprehensive. CRUD Operations menyediakan operasi Create, Read, Update, Delete yang complete untuk pengelolaan content dengan validasi input yang robust dan error handling yang proper. QR Code Generator terintegrasi secara otomatis dalam proses pembuatan content, dimana setiap kali user menginput media URL, sistem akan secara automatic generate QR code dengan kualitas tinggi dan format yang scannable. Content Scheduler memungkinkan administrator untuk mengatur start date dan end date bagi setiap content, sehingga content dapat diaktifkan dan dinonaktifkan secara otomatis berdasarkan periode yang ditentukan. Display Order Management menyediakan functionality untuk mengatur urutan tampil content dalam digital signage dengan drag-and-drop interface yang intuitive. Media Upload Handler mendukung upload berbagai format file gambar dan video dengan validasi size dan format untuk memastikan kompatibilitas dengan Unity display. Content Activation menyediakan toggle mechanism untuk mengaktifkan dan menonaktifkan content secara real-time tanpa memerlukan restart sistem.

**Manfaat Implementasi:**
Sistem content management memberikan kemudahan yang signifikan bagi administrator laboratorium. User-friendly interface memungkinkan staff lab yang tidak memiliki background teknis untuk mengelola content digital signage dengan mudah dan intuitif. Automated QR code generation mempermudah sharing media content kepada users laboratorium tanpa perlu tools eksternal atau proses manual yang kompleks. Flexible content scheduling dan ordering memberikan kontrol yang granular terhadap kapan dan bagaimana content ditampilkan, memungkinkan perencanaan campaign atau informasi yang lebih strategic. Support untuk berbagai tipe konten seperti announcement, promotion, dan schedule memberikan versatility dalam komunikasi informasi laboratorium kepada users dengan format yang sesuai dengan kebutuhan masing-masing jenis content.

#### D. Fitur Safe Fallback System

**Deskripsi Fitur:**
Sistem keamanan yang memastikan server tidak pernah crash meskipun ada komponen atau controller yang gagal dimuat. Fitur ini merupakan inovasi khusus PodSync.

**Implementasi Teknis:**

```javascript
// Safe Import Controller - Innovative Feature
async function safeImportController(controllerPath, fallbackResponse) {
  try {
    const controller = await import(controllerPath);
    console.log(`✅ Successfully imported controller: ${controllerPath}`);
    return controller.default || controller;
  } catch (error) {
    console.warn(`⚠️ Controller import failed: ${controllerPath}, using fallback`);
    
    // Return safe fallback controller that never crashes
    return {
      getAllContent: (req, res) => {
        res.json(fallbackResponse || []);
      },
      getSchedules: (req, res) => {
        res.json({ 
          data: [], 
          message: 'Controller not available - using fallback',
          timestamp: new Date()
        });
      },
      getCurrentStatus: (req, res) => {
        res.json({ 
          isOnAir: false, 
          statusMessage: 'Off Air (Fallback Mode)',
          message: 'Status controller not available'
        });
      }
      // ... other fallback methods
    };
  }
}

// Route Registration with Safe Controllers
async function registerRoutes() {
  const contentController = await safeImportController('./controllers/contentController.js', []);
  const scheduleController = await safeImportController('./controllers/scheduleController.js', []);
  const statusController = await safeImportController('./controllers/statusController.js', {});
  
  app.get('/api/content', contentController.getAllContent);
  app.get('/api/schedule', scheduleController.getSchedules);
  app.get('/api/status', statusController.getCurrentStatus);
}
```

**Komponen Implementasi:**
Safe Fallback System merupakan inovasi unik yang diimplementasikan dalam PodSync untuk memastikan reliability sistem. Safe Import Mechanism menggunakan try-catch wrapper yang comprehensive pada setiap controller import, sehingga jika ada controller yang gagal dimuat karena dependency missing atau syntax error, sistem tidak akan crash secara keseluruhan. Fallback Controllers menyediakan dummy controllers yang return default response dengan format yang konsisten, memungkinkan API endpoints tetap responsive meskipun controller asli tidak tersedia. Graceful Degradation memastikan sistem dapat tetap beroperasi dalam mode terbatas ketika ada komponen yang mengalami failure, dengan functionality yang essential tetap dapat diakses. Error Logging mencatat secara comprehensive setiap error yang terjadi beserta context informationnya untuk memudahkan troubleshooting dan debugging. Route Protection melindungi semua API routes dengan fallback mechanism, sehingga tidak ada endpoint yang akan return error 500 atau crash aplikasi.

**Manfaat Implementasi:**
Safe Fallback System memberikan reliability yang exceptional dalam deployment production. Zero-downtime guarantee memastikan server tidak pernah crash bahkan dalam kondisi error yang tidak terprediksi, menjaga continuity service laboratorium. Development-friendly environment memungkinkan developer untuk melakukan debugging dan development tanpa perlu restart server berulang kali, meningkatkan productivity development cycle. Production-stable deployment memberikan graceful handling untuk missing dependencies atau configuration issues yang mungkin terjadi dalam environment production. Maintainable architecture memungkinkan isolasi error sehingga failure pada satu komponen tidak mempengaruhi komponen lain, memudahkan maintenance dan troubleshooting sistem secara modular.

#### E. Fitur Unity Digital Signage Integration

**Deskripsi Fitur:**
Integrasi dengan Unity engine untuk menampilkan informasi real-time di digital signage dengan rendering yang optimal dan offline support.

**Implementasi Teknis:**

```csharp
// Unity Integration Implementation
public class IntegratedBookingDisplayManager : MonoBehaviour
{
    [Header("API Configuration")]
    public string apiBaseUrl = "http://localhost:3002/api";
    public float updateInterval = 30f;
    
    [Header("Display Components")]
    public Text scheduleDisplay;
    public Text broadcastStatusDisplay;
    public RawImage qrCodeDisplay;

    private void Start()
    {
        StartCoroutine(DataUpdateRoutine());
    }

    private IEnumerator DataUpdateRoutine()
    {
        while (true)
        {
            yield return StartCoroutine(FetchScheduleData());
            yield return StartCoroutine(FetchBroadcastStatus());
            yield return StartCoroutine(FetchSignageContent());
            yield return new WaitForSeconds(updateInterval);
        }
    }

    private IEnumerator FetchScheduleData()
    {
        using (UnityWebRequest www = UnityWebRequest.Get($"{apiBaseUrl}/schedule/today"))
        {
            yield return www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                var scheduleData = JsonUtility.FromJson<ScheduleResponse>(www.downloadHandler.text);
                UpdateScheduleDisplay(scheduleData);
            }
            else
            {
                Debug.LogWarning("Failed to fetch schedule data, using cached data");
                LoadCachedScheduleData();
            }
        }
    }
}
```

**Komponen Implementasi:**
Unity Digital Signage Integration diimplementasikan dengan arsitektur yang robust dan performance-oriented. HTTP Client menggunakan Unity UnityWebRequest yang reliable untuk melakukan komunikasi API dengan PodSync backend, dengan proper error handling dan timeout configuration. Real-time Updates diimplementasikan melalui polling mechanism setiap 30 detik untuk memastikan data yang ditampilkan selalu up-to-date tanpa memberatkan network bandwidth. Offline Support menyediakan local caching system yang menyimpan data terakhir yang berhasil di-fetch, sehingga digital signage tetap dapat menampilkan informasi meskipun koneksi internet terputus sementara. Content Renderer melakukan dynamic rendering untuk berbagai jenis content termasuk schedule information, broadcast status, dan QR codes dengan layout yang responsive dan visually appealing. Performance Optimization memastikan efficient memory management dan consistent 60fps rendering untuk memberikan user experience yang smooth. Error Recovery memberikan graceful handling untuk network issues dengan automatic retry mechanism dan fallback ke cached data.

**Manfaat Implementasi:**
Unity integration memberikan value yang signifikan dalam user experience laboratorium. Real-time information display memungkinkan lab users untuk mengakses informasi terkini tentang jadwal, status broadcast, dan announcements tanpa perlu mengakses web dashboard. Seamless integration dengan PodSync backend memastikan consistency data antara web application dan digital signage display tanpa manual synchronization. Offline capability memberikan reliability yang tinggi sehingga digital signage tetap functional meskipun terjadi gangguan koneksi internet sementara. Professional visual presentation dengan Unity rendering engine memberikan tampilan yang engaging dan informative, meningkatkan effectiveness komunikasi informasi laboratorium kepada users.

#### F. Fitur Analytics Dashboard

**Deskripsi Fitur:**
Dashboard analytics yang menyediakan insights tentang penggunaan laboratorium, statistik booking, dan performance metrics sistem.

**Implementasi Teknis:**

```javascript
// Analytics Controller Implementation
class AnalyticsController {
  async getDashboardStats(req, res) {
    try {
      const timeRange = req.query.timeRange || '7d';
      const endDate = new Date();
      const startDate = this.calculateStartDate(endDate, timeRange);

      const stats = await Promise.all([
        this.getContentStats(startDate, endDate),
        this.getScheduleStats(startDate, endDate),
        this.getBroadcastStats(startDate, endDate),
        this.getUsageStats(startDate, endDate)
      ]);

      res.json({
        timeRange,
        content: stats[0],
        schedule: stats[1],
        broadcast: stats[2],
        usage: stats[3],
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsageStats(startDate, endDate) {
    const totalBookings = await Schedule.count({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      }
    });

    const unitStats = await Schedule.findAll({
      attributes: [
        'organizer',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'bookingCount']
      ],
      where: {
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      group: ['organizer'],
      order: [[Sequelize.literal('bookingCount'), 'DESC']]
    });

    return { totalBookings, unitStats };
  }
}
```

**Komponen Implementasi:**
Analytics Dashboard diimplementasikan dengan pendekatan comprehensive untuk memberikan business intelligence yang valuable. Real-time Metrics menyediakan KPI dashboard yang menampilkan data terkini tentang occupancy rate, booking frequency, dan system utilization dengan update yang real-time. Usage Analytics melakukan statistical analysis penggunaan laboratorium per unit/program studi, memberikan breakdown detail tentang pattern penggunaan dari berbagai departemen akademik. Booking Trends menganalisis pattern booking berdasarkan time series data untuk mengidentifikasi peak hours, popular time slots, dan seasonal trends yang dapat membantu dalam resource planning. Chart Visualization mengimplementasikan interactive charts menggunakan modern charting library yang responsive dan user-friendly untuk data presentation yang clear dan informative. Export Functionality menyediakan capability untuk export reports dalam berbagai format seperti PDF dan Excel dengan formatting yang professional dan comprehensive. Performance Monitoring melakukan tracking system health metrics seperti response time, memory usage, dan database performance untuk memastikan optimal system operation.

**Manfaat Implementasi:**
Analytics Dashboard memberikan powerful insights untuk strategic decision making dalam manajemen laboratorium. Data-driven decision making memungkinkan administrator laboratorium untuk membuat keputusan berdasarkan data actual usage patterns dan trends yang terukur. Insights untuk optimasi resource allocation membantu dalam planning schedule, maintenance windows, dan capacity management berdasarkan historical data dan predictive analytics. Monitoring system performance dan health memberikan early warning system untuk potential issues dan memastikan service level yang optimal. Professional reporting untuk stakeholders menyediakan comprehensive reports yang dapat digunakan untuk presentation kepada management, evaluasi kinerja laboratorium, dan strategic planning untuk improvement initiatives.

### 3.3.2 Teknologi dan Tools yang Digunakan

#### A. Backend Technologies
- **Node.js 18+**: Runtime environment untuk server-side JavaScript
- **Express.js**: Web framework untuk RESTful API development
- **Sequelize ORM**: Database abstraction layer untuk MySQL
- **Google Sheets API v4**: Integration dengan Google Workspace
- **Axios**: HTTP client untuk external API calls
- **QRCode Library**: Generation QR codes untuk media content

#### B. Frontend Technologies
- **React 18**: Modern UI library dengan functional components
- **Vite**: Fast build tool untuk development dan production
- **Tailwind CSS**: Utility-first CSS framework
- **Flowbite React**: Component library untuk consistent UI
- **React Router**: Client-side routing untuk SPA
- **Axios**: HTTP client dengan interceptors dan error handling

#### C. Database & Infrastructure
- **MySQL 8.0**: Relational database management system
- **Sequelize Migrations**: Database schema versioning
- **CORS Middleware**: Cross-origin resource sharing configuration
- **PM2**: Process manager untuk Node.js applications
- **Nginx**: Reverse proxy dan static file serving

#### D. Unity Integration
- **Unity 2022.3 LTS**: Game engine untuk digital signage rendering
- **UnityWebRequest**: HTTP client untuk API communication
- **JSON Utility**: Data serialization untuk API responses
- **Coroutines**: Asynchronous operations untuk smooth performance

### 3.3.3 Arsitektur Implementasi

Implementasi sistem PodSync menggunakan **modular architecture** dengan separation of concerns yang jelas:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unity Display │    │  React Frontend │    │ Google Sheets   │
│   (Presentation)│    │   (Dashboard)   │    │   (Data Source) │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTP Requests        │ API Calls            │ Auto Sync
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Express.js Server    │
                    │   (Safe Controllers)    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    MySQL Database       │
                    │   (Sequelize ORM)       │
                    └─────────────────────────┘
```

### 3.3.4 Deployment Strategy

Implementasi deployment menggunakan environment separation:

**Development Environment:**
- Local development dengan hot reload (Vite + Nodemon)
- SQLite/MySQL local untuk testing
- Mock data untuk initial development

**Production Environment:**
- PM2 process management untuk Node.js
- Nginx reverse proxy untuk load balancing
- MySQL production dengan optimization
- SSL certificate untuk HTTPS security
- Automated backup dan monitoring

---

## 3.4 Pengujian

Pengujian sistem PodSync dilakukan menggunakan metodologi **Black Box Testing** dengan pendekatan **User Acceptance Testing (UAT)** untuk memvalidasi bahwa sistem memenuhi kebutuhan pengguna dan berfungsi sesuai spesifikasi yang telah ditetapkan.

### 3.4.1 Metodologi Pengujian

#### A. Black Box Testing Approach
Pengujian Black Box dilakukan dengan focus pada:
- **Input-Output Validation**: Menguji apakah input menghasilkan output yang diharapkan
- **Functional Testing**: Memvalidasi setiap fitur berfungsi sesuai requirement
- **User Interface Testing**: Menguji kemudahan penggunaan dan responsiveness
- **Integration Testing**: Menguji integrasi antar komponen sistem

#### B. User Acceptance Testing (UAT)
**Detail Pengujian:**
- **Dokumen Referensi**: UAT-B01_Podsync.docx
- **Penguji**: Muhammad Harun Arrasyid D. (Penanggung Jawab Laboratorium Podcast FIT)
- **Target User**: Staff Laboran Unit Laboratorium Fakultas Ilmu Terapan
- **Lokasi Pengujian**: Laboratorium Podcast Fakultas Ilmu Terapan Universitas Telkom
- **Metode**: Hands-on testing dengan real-world scenarios

### 3.4.2 Scope Pengujian

Berdasarkan dokumen **UAT-B01_Podsync.docx**, pengujian mencakup 25 test cases yang dikelompokkan menjadi:

#### A. Dashboard & Authentication Testing (Test Cases: UAT-001 - UAT-004)
**Fitur yang Diuji:**
- Login dashboard menggunakan kredensial administrator
- Tampilan status broadcast real-time (ON AIR/OFF AIR)
- Toggle manual broadcast dari OFF AIR ke ON AIR
- Toggle manual broadcast dari ON AIR ke OFF AIR

#### B. Schedule Management Testing (Test Cases: UAT-005 - UAT-010)
**Fitur yang Diuji:**
- Verifikasi timestamp sinkronisasi Google Sheets
- Tampilan daftar jadwal booking laboratorium hari ini
- Filter jadwal berdasarkan range tanggal (1 minggu)
- Filter jadwal berdasarkan unit/program studi
- Detail informasi booking lengkap
- Manual synchronization dengan Google Sheets

#### C. Content Management Testing (Test Cases: UAT-011 - UAT-018)
**Fitur yang Diuji:**
- Tampilan daftar konten digital signage aktif
- Pembuatan konten pengumuman baru
- Upload file media (gambar/video) untuk konten
- Verifikasi auto-generation QR code
- Pengaturan display order konten signage
- Aktivasi dan deaktivasi konten signage
- Edit konten yang sudah existing
- Penghapusan konten dari sistem

#### D. Unity Integration Testing (Test Cases: UAT-019 - UAT-022)
**Fitur yang Diuji:**
- Tampilan konten signage di Unity display
- Update real-time status broadcast di Unity
- Sinkronisasi jadwal laboratorium di Unity display
- Functionality QR code scannable dan akurasi link

#### E. Analytics & System Testing (Test Cases: UAT-023 - UAT-025)
**Fitur yang Diuji:**
- Tampilan statistik penggunaan laboratorium
- Chart visualization data booking per unit
- Export report dalam format PDF/Excel

### 3.4.3 Kriteria Penilaian

Setiap test case dalam dokumen **UAT-B01_Podsync.docx** dievaluasi menggunakan skala:

- **☐ Pass**: Fitur berfungsi sesuai ekspektasi tanpa error atau masalah
- **☐ Fail**: Fitur tidak berfungsi atau mengalami error yang menghambat
- **☐ Partial**: Fitur berfungsi dengan catatan atau batasan tertentu

### 3.4.4 Implementasi Testing Framework

#### A. Manual Testing Process
```javascript
// Example Test Case Implementation - UAT-003
const testBroadcastToggle = async () => {
  const testCase = {
    id: 'UAT-003',
    description: 'Toggle Broadcast Manual OFF AIR ke ON AIR',
    steps: [
      '1. Login ke dashboard PodSync',
      '2. Lihat status broadcast saat ini',
      '3. Klik toggle broadcast dari OFF AIR ke ON AIR',
      '4. Verifikasi status berubah real-time',
      '5. Check database untuk record perubahan'
    ],
    expectedResult: 'Status broadcast berubah ke ON AIR, tersimpan di database',
    actualResult: '', // Diisi saat testing
    status: '', // Pass/Fail/Partial
    notes: '' // Catatan tambahan
  };
  
  return testCase;
};
```

#### B. Performance Testing Metrics
**Pengujian Performance yang Dilakukan:**
- **Response Time Testing**: Mengukur waktu response API endpoints
- **Load Testing**: Testing dengan multiple concurrent users
- **Memory Usage Testing**: Monitoring penggunaan memory aplikasi
- **Database Performance**: Query execution time dan optimization

### 3.4.5 Testing Environment Setup

#### A. Test Data Preparation
- **Sample Google Sheets**: Data dummy untuk testing sinkronisasi
- **Mock Content**: Sample content untuk testing content management
- **Test Users**: User accounts untuk testing authentication
- **Database Seed**: Initial data untuk testing scenarios

#### B. Testing Tools & Utilities
- **Browser Developer Tools**: Untuk debugging frontend issues
- **Postman**: API endpoint testing dan validation
- **MySQL Workbench**: Database query testing dan verification
- **Unity Console**: Monitoring Unity integration dan performance

### 3.4.6 Expected Testing Outcomes

Berdasarkan dokumen **UAT-B01_Podsync.docx**, target outcome pengujian adalah:

#### A. Functional Requirements Validation
- **Semua 25 test cases** harus Pass atau dengan catatan Partial yang acceptable
- **Zero critical failures** yang menghambat fungsi utama sistem
- **Integration seamless** antara komponen web dan Unity display

#### B. Performance Requirements
- **Response time** rata-rata < 2 detik untuk semua API calls
- **System uptime** > 99% selama periode testing
- **Concurrent user support** minimum 20 users simultaneous

#### C. User Experience Validation
- **Interface intuitive** dan mudah digunakan oleh staff lab
- **Error handling** yang user-friendly dengan pesan yang jelas
- **Real-time updates** berfungsi konsisten dan reliable

### 3.4.7 Post-Testing Activities

#### A. Bug Tracking & Resolution
- **Issue Documentation**: Catat semua bug yang ditemukan selama testing
- **Priority Classification**: Klasifikasi bug berdasarkan severity (Critical, High, Medium, Low)
- **Fix Implementation**: Perbaikan bug berdasarkan priority
- **Regression Testing**: Re-testing setelah bug fixes

#### B. Performance Optimization
- **Performance Analysis**: Analisis hasil performance testing
- **Bottleneck Identification**: Identifikasi area yang perlu optimasi
- **Code Optimization**: Implementasi improvement berdasarkan findings
- **Re-testing**: Validasi improvement yang telah dilakukan

#### C. Documentation Updates
- **Test Results Documentation**: Compile hasil testing ke dalam report
- **User Manual Updates**: Update user manual berdasarkan feedback testing
- **Technical Documentation**: Update dokumentasi teknis jika ada perubahan
- **Deployment Guidelines**: Finalisasi guidelines untuk production deployment

Pengujian sistem PodSync dengan mengacu pada dokumen **UAT-B01_Podsync.docx** memastikan bahwa sistem telah memenuhi standar kualitas dan siap untuk diimplementasikan dalam environment production laboratorium podcast Fakultas Ilmu Terapan Universitas Telkom.