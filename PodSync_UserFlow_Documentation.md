# PodSync & Digital Signage Laboratorium Podcast - User Flow Documentation

## System Overview
PodSync adalah sistem manajemen konten digital signage untuk laboratorium podcast yang terintegrasi dengan Google Sheets untuk booking lab dan Unity Digital Signage untuk display real-time.

---

## 1. USER FLOW - ADMIN PODSYNC WEB APP

### A. Dashboard Management Flow
```
[Admin Login] 
      ↓
[Dashboard Page]
      ↓
[Choose Action]:
├── [Broadcast Control] ──→ [Toggle ON AIR/OFF AIR] ──→ [Status Updated]
├── [Schedule Management] ──→ [View/Edit Lab Bookings] ──→ [Schedule Updated]  
├── [Content Management] ──→ [Create/Edit Signage Content] ──→ [Content Published]
└── [Analytics] ──→ [View Usage Reports] ──→ [Export Data]
```

### B. Broadcast Control Flow
```
[Admin Access Dashboard]
      ↓
[Broadcast Control Center]
      ↓
[Current Status Display] ← [Real-time Status Check]
      ↓
[Manual Toggle Decision]:
├── [Turn ON AIR] ──→ [Confirm Action] ──→ [Update Status] ──→ [Notify Unity]
└── [Turn OFF AIR] ──→ [Confirm Action] ──→ [Update Status] ──→ [Notify Unity]
      ↓
[Status Updated Confirmation]
      ↓
[Auto-refresh Dashboard] ──→ [Display New Status]
```

### C. Schedule Management Flow
```
[Admin Access Schedule Page]
      ↓
[Google Sheets Sync Status Check]
      ↓
[Schedule List Display]:
├── [Filter Options]: [Date Range] / [Status] / [Unit/Prodi]
├── [Sort Options]: [Date] / [Time] / [Duration]
└── [Search]: [Name] / [Unit] / [Purpose]
      ↓
[Schedule Actions]:
├── [View Details] ──→ [Schedule Information Display]
├── [Edit Schedule] ──→ [Modify Time/Date] ──→ [Save Changes]
├── [Delete Schedule] ──→ [Confirm Deletion] ──→ [Remove Entry]
└── [Manual Sync] ──→ [Force Google Sheets Sync] ──→ [Update List]
```

### D. Content Management Flow
```
[Admin Access Signage Content]
      ↓
[Content List Display]
      ↓
[Content Actions]:
├── [Create New Content]:
│   ├── [Enter Title & Description]
│   ├── [Select Content Type]: [Announcement] / [Promotion] / [Schedule] / [Other]
│   ├── [Upload Media] ──→ [Auto QR Code Generation]
│   ├── [Set Display Order & Active Status]
│   ├── [Set Display Date Range] (Optional)
│   └── [Save Content] ──→ [Publish to Signage]
│
├── [Edit Existing Content]:
│   ├── [Modify Content Details]
│   ├── [Update Media] ──→ [Re-generate QR Code]
│   ├── [Change Display Settings]
│   └── [Save Changes] ──→ [Update Signage]
│
└── [Delete Content] ──→ [Confirm Deletion] ──→ [Remove from Signage]
```

### E. Analytics Flow
```
[Admin Access Analytics]
      ↓
[Analytics Dashboard]
      ↓
[Select Report Type]:
├── [Usage Analytics]:
│   ├── [Peak Hours Analysis]
│   ├── [Facility Usage Distribution] 
│   ├── [Unit/Prodi Statistics]
│   └── [Booking Duration Trends]
│
├── [Broadcast Analytics]:
│   ├── [ON AIR Time Statistics]
│   ├── [Manual vs Auto Control Analysis]
│   ├── [Status Change Frequency]
│   └── [Source Attribution]
│
└── [Content Analytics]:
    ├── [Content Performance Metrics]
    ├── [Display Duration Analysis]
    ├── [Content Type Distribution]
    └── [QR Code Usage Statistics]
      ↓
[View Interactive Charts]
      ↓
[Export Options]: [PDF] / [Excel] / [CSV]
```

---

## 2. USER FLOW - MAHASISWA/DOSEN (GOOGLE FORMS)

### Lab Booking Request Flow
```
[User Access Google Form]
      ↓
[Fill Booking Form]:
├── [Personal Information]:
│   ├── [Nama Lengkap]
│   ├── [NIP/Kode Dosen/NIM]
│   ├── [No Telepon Mobile]
│   └── [Unit/Prodi]
│
├── [Booking Details]:
│   ├── [Keperluan Peminjaman]
│   ├── [Jenis Fasilitas]
│   ├── [Tanggal Mulai & Selesai]
│   ├── [Jam Mulai & Berakhir]
│   └── [Jumlah Jam]
│
└── [Submit Form]
      ↓
[Google Sheets Auto-Update]
      ↓
[PodSync Auto-Sync] ──→ [New Schedule Created]
      ↓
[Booking Confirmation] ← [Admin Review]
      ↓
[Schedule Active] ──→ [Auto ON AIR during booking time]
```

---

## 3. USER FLOW - PENGUNJUNG LABORATORIUM

### Digital Signage Viewing Flow  
```
[Enter Laboratorium Area]
      ↓
[View Digital Signage Display]
      ↓
[Display Information]:
├── [Current Time & Date] (Indonesian format)
├── [Broadcast Status]: [ON AIR] / [OFF AIR]
├── [Current Schedule]:
│   ├── [Active Booking Info] (if any)
│   ├── [Peminjam Name]
│   ├── [Time Slot]
│   └── [Duration]
├── [Upcoming Schedules]:
│   ├── [Next 5 Bookings]
│   ├── [Today's Schedule]
│   └── [Time Slots]
└── [Signage Content]:
    ├── [Announcements]
    ├── [Promotions]
    ├── [QR Codes for Media]
    └── [Other Information]
      ↓
[Optional QR Code Scan] ──→ [Access Media Content]
      ↓
[Real-time Updates] ← [Auto-refresh every 30 seconds]
```

---

## 4. USER FLOW - UNITY DIGITAL SIGNAGE OPERATOR

### Digital Signage Control Flow
```
[Unity Application Launch]
      ↓
[Check PodSync Connection]
      ↓
[Connection Status]:
├── [Connected] ──→ [Display Current Status]
└── [Disconnected] ──→ [Show Fallback Content] + [Retry Connection]
      ↓
[Real-time Data Sync]:
├── [Broadcast Status Updates] (every 30 seconds)
├── [Schedule Data Refresh] (every 60 seconds)
└── [Content Updates] (real-time)
      ↓
[Display Updates]:
├── [Status Indicators]: [ON AIR] / [OFF AIR]
├── [Current Time Display] (HH:MM format, Indonesian)
├── [Current Date Display] (Indonesian format)
├── [Active Booking Display]
└── [Upcoming Schedule List]
      ↓
[Manual Control] (Optional):
├── [Space Key Toggle] ──→ [Manual ON/OFF AIR]
├── [Send Status to PodSync]
└── [Update Local Display]
      ↓
[Error Handling]:
├── [Connection Lost] ──→ [Retry with Fallback URLs]
├── [API Errors] ──→ [Display Error State]
└── [Network Issues] ──→ [Show Last Known Status]
```

---

## 5. SYSTEM FLOW - AUTOMATED PROCESSES

### A. Google Sheets Sync Flow
```
[Google Form Submission]
      ↓
[Google Sheets Updated]
      ↓
[PodSync Auto-Sync] (every 5 minutes)
      ↓
[Fetch New Entries]
      ↓
[Data Processing]:
├── [Validate Data Format]
├── [Parse Date/Time]
├── [Check for Duplicates]
└── [Map to Schedule Format]
      ↓
[Create Schedule Records]
      ↓
[Update Database]
      ↓
[Broadcast Change Notification]
```

### B. Auto Broadcast Control Flow
```
[Schedule Time Check] (every minute)
      ↓
[Current Time vs Schedule Time]:
├── [Schedule Starting] ──→ [Auto ON AIR]
├── [Schedule Ending] ──→ [Auto OFF AIR]  
└── [No Schedule Change] ──→ [Maintain Status]
      ↓
[Priority Check]:
├── [Manual Override Active] ──→ [Keep Manual Status]
├── [System Override] ──→ [Apply System Status]
└── [Auto Control] ──→ [Apply Schedule Status]
      ↓
[Update Broadcast Status]
      ↓
[Notify All Connected Clients]:
├── [Unity Digital Signage]
├── [PodSync Dashboard]
└── [Analytics System]
```

### C. Content QR Code Generation Flow
```
[Content Created/Updated]
      ↓
[Media URL Check]
      ↓
[Media URL Present]:
├── [Yes] ──→ [Generate QR Code]:
│   ├── [Create QR Image]
│   ├── [Upload to Server]
│   ├── [Update qr_code_url field]
│   └── [Notify Digital Signage]
└── [No] ──→ [Clear qr_code_url field]
      ↓
[Content Ready for Display]
```

---

## 6. ERROR HANDLING FLOWS

### A. Connection Error Flow
```
[Connection Attempt Failed]
      ↓
[Try Fallback URLs]
      ↓
[All URLs Failed]:
├── [Display Error State]
├── [Show Last Known Data]
├── [Schedule Retry Attempt]
└── [Log Error Details]
      ↓
[Retry Connection] (every 30 seconds)
      ↓
[Connection Restored] ──→ [Resume Normal Operation]
```

### B. Data Sync Error Flow
```
[Sync Process Failed]
      ↓
[Error Type Check]:
├── [Network Error] ──→ [Retry with Backoff]
├── [Data Format Error] ──→ [Log and Skip Record]
├── [Database Error] ──→ [Rollback and Retry]
└── [Permission Error] ──→ [Alert Admin]
      ↓
[Error Resolution]:
├── [Auto-retry] (if recoverable)
├── [Manual Intervention Required]
└── [Fallback to Last Known Good State]
```

---

## 7. INTEGRATION POINTS

### A. PodSync ↔ Unity Integration
```
[PodSync Status Change]
      ↓
[API Endpoint]: /api/broadcast/unity/status
      ↓
[Unity Polling] (every 30 seconds)
      ↓
[Status Update in Unity]
      ↓
[Display Refresh]

[Unity Manual Control]
      ↓
[Send to PodSync]: POST /api/broadcast/unity/status
      ↓
[PodSync Status Update]
      ↓
[Dashboard Refresh]
```

### B. Google Sheets ↔ PodSync Integration
```
[Google Form Submission]
      ↓
[Google Sheets API]
      ↓
[PodSync Sync Service] (every 5 minutes)
      ↓
[Fetch New Rows]
      ↓
[Process and Store]
      ↓
[Create Schedule Records]
      ↓
[Trigger Auto Broadcast] (if applicable)
```

---

## 8. USER PERSONAS & USE CASES

### Admin PodSync
- **Goal**: Manage lab broadcast and content efficiently
- **Tasks**: Monitor status, schedule management, content updates
- **Pain Points**: Manual broadcast control, content scheduling

### Lab Manager
- **Goal**: Oversee lab usage and booking system
- **Tasks**: Review bookings, manage schedules, generate reports
- **Pain Points**: Double bookings, schedule conflicts

### Mahasiswa/Dosen
- **Goal**: Book lab facilities easily
- **Tasks**: Submit booking requests, check availability
- **Pain Points**: Complex booking process, unclear availability

### Pengunjung Lab
- **Goal**: Understand current lab status and schedule
- **Tasks**: View current activity, check upcoming bookings
- **Pain Points**: Unclear lab status, outdated information

### Technical Operator
- **Goal**: Maintain system reliability
- **Tasks**: Monitor system health, troubleshoot issues
- **Pain Points**: System downtime, integration failures

---

This comprehensive user flow documentation covers all major user interactions and system processes in the PodSync & Digital Signage Laboratorium Podcast system.