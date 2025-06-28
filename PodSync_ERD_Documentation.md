# PodSync Database ERD Documentation

## Entity Relationship Diagram (ERD)

### Database: `podsync_db`
### ORM: Sequelize (MySQL/MariaDB)
### Timezone: Asia/Jakarta (+07:00 WIB)

---

## MySQL Table Creation Scripts

### 1. **google_sheet_entries**
*Primary data source from Google Forms/Sheets*

```sql
CREATE TABLE google_sheet_entries (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    version INTEGER DEFAULT 1,
    timestamp DATE NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    nip_kode_dosen_nim VARCHAR(50),
    no_telepon_mobile VARCHAR(20),
    unit_prodi VARCHAR(100),
    keperluan_peminjaman VARCHAR(255),
    jenis_fasilitas_dipinjam VARCHAR(100),
    tanggal_mulai_peminjaman DATE NOT NULL,
    tanggal_selesai_peminjaman DATE NOT NULL,
    bulan_peminjaman VARCHAR(20),
    jam_mulai TIME NOT NULL,
    jam_berakhir TIME NOT NULL,
    jumlah_jam INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_nip_kode_dosen_nim (nip_kode_dosen_nim),
    INDEX idx_tanggal_mulai_peminjaman (tanggal_mulai_peminjaman),
    INDEX idx_tanggal_selesai_peminjaman (tanggal_selesai_peminjaman),
    UNIQUE KEY unique_timestamp_nip (timestamp, nip_kode_dosen_nim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. **schedules**
*Processed lab booking schedules*

```sql
CREATE TABLE schedules (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending', 'ongoing', 'completed') DEFAULT 'pending',
    location VARCHAR(255),
    organizer VARCHAR(100),
    last_synced_at DATE,
    google_sheet_entry_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_date_start_time (date, start_time),
    INDEX idx_google_sheet_entry_id (google_sheet_entry_id),
    
    FOREIGN KEY (google_sheet_entry_id) REFERENCES google_sheet_entries(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    CONSTRAINT chk_end_time_after_start_time CHECK (end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. **broadcast_statuses**
*Broadcast on/off air status tracking*

```sql
CREATE TABLE broadcast_statuses (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    is_on_air BOOLEAN DEFAULT FALSE,
    status_message VARCHAR(255) DEFAULT 'Off Air',
    updated_by VARCHAR(100) DEFAULT 'system',
    last_updated DATE DEFAULT (CURRENT_DATE),
    schedule_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_last_updated (last_updated),
    INDEX idx_is_on_air (is_on_air),
    INDEX idx_schedule_id (schedule_id),
    
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. **signage_content**
*Digital signage content management*

```sql
CREATE TABLE signage_content (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    type ENUM('announcement', 'promotion', 'schedule', 'other') DEFAULT 'other',
    media_url TEXT,
    qr_code_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NULL,
    end_date DATE NULL,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Database Initialization Script

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS podsync_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE podsync_db;

-- Set timezone
SET time_zone = '+07:00';

-- Execute table creation scripts in order (due to foreign key dependencies)
-- 1. google_sheet_entries (no dependencies)
-- 2. schedules (depends on google_sheet_entries)
-- 3. broadcast_statuses (depends on schedules)
-- 4. signage_content (no dependencies)
```

---

## Entity Relationships

### Relationship Diagram

```
google_sheet_entries (1) ──────┐ 
                               ├─ (0..n) schedules (1) ──────┐
                               │                             ├─ (0..n) broadcast_statuses
                               └─────────────────────────────┘

signage_content (Independent - No direct relationships)
```

### Relationship Details

#### 1. **GoogleSheetEntry → Schedule** (One-to-Many, Optional)
- **Type**: 1:N (Optional)
- **Foreign Key**: `schedules.google_sheet_entry_id` → `google_sheet_entries.id`
- **Constraint**: SET NULL ON DELETE, CASCADE ON UPDATE
- **Description**: One Google Sheet entry can generate multiple schedule records

#### 2. **Schedule → BroadcastStatus** (One-to-Many, Optional) 
- **Type**: 1:N (Optional)
- **Foreign Key**: `broadcast_statuses.schedule_id` → `schedules.id`
- **Constraint**: SET NULL ON DELETE, CASCADE ON UPDATE  
- **Description**: One schedule can have multiple broadcast status changes

#### 3. **SignageContent** (Independent)
- **Type**: Standalone entity
- **Description**: Self-contained digital signage content with no direct FK relationships

---

## Data Flow Architecture

### Primary Data Flow
```
Google Forms/Sheets → google_sheet_entries → schedules → broadcast_statuses
                                                      ↓
                                              Unity Digital Signage
```

### Secondary Flows
```
Manual Broadcast Control → broadcast_statuses (without schedule_id)
                                     ↓
                           Unity Digital Signage

Content Management → signage_content → Digital Signage Display
```

---

## Key Features

### Database Features
- **Soft Deletes**: Enabled on `google_sheet_entries` (paranoid: true)
- **Timezone Handling**: MySQL set to +07:00 (Jakarta/WIB)
- **Auto QR Generation**: Triggered on `signage_content.media_url` changes
- **Timestamp Hooks**: Auto-update `last_updated` in broadcast_statuses

### Indexing Strategy
- **Date Range Queries**: Optimized for schedule and booking date ranges
- **Status Lookups**: Fast broadcast status retrieval
- **Foreign Key Performance**: Indexed relationships for JOIN operations
- **Analytics Queries**: Supports complex aggregation for reporting

### Data Integrity
- **Foreign Key Constraints**: Maintains referential integrity with CASCADE/SET NULL
- **Enum Validations**: Controlled vocabulary for status and content types
- **Time Validations**: End time must be after start time in schedules
- **Unique Constraints**: Prevents duplicate Google Sheet entries

---

## Analytics Support

The ERD supports comprehensive analytics including:
- **Usage Patterns**: By time, facility, academic unit
- **Peak Hours Analysis**: From jam_mulai distribution  
- **Session Duration**: From broadcast status timestamps
- **Content Engagement**: Signage content performance
- **Booking Trends**: Historical booking patterns and statistics

---

## Technical Notes

### Database Configuration
- **Charset**: utf8mb4 (full Unicode support)
- **Collation**: utf8mb4_unicode_ci
- **Engine**: InnoDB (transaction support)
- **Timezone**: Asia/Jakarta (+07:00)

### Sequelize Configuration
- **Naming**: snake_case with underscored: true
- **Timestamps**: Automatic created_at/updated_at
- **Soft Deletes**: paranoid: true on google_sheet_entries
- **Associations**: Proper foreign key definitions with constraints