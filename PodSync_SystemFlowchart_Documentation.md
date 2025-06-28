# PodSync System Flowchart Documentation

## System Architecture Overview

PodSync adalah sistem terintegrasi yang menghubungkan Google Sheets, web dashboard, database MySQL, dan Unity Digital Signage untuk manajemen laboratorium podcast.

---

## 1. SYSTEM ARCHITECTURE FLOWCHART

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google Forms  │────│  Google Sheets  │────│   PodSync API   │
│   (Lab Booking) │    │   (Data Store)  │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Users   │────│   PodSync Web   │────│   MySQL DB      │
│   (Dashboard)   │    │   (Frontend)    │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Lab Visitors   │────│  Unity Digital  │────│   API Gateway   │
│  (Viewers)      │    │   Signage       │    │   (Bridge)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 2. DATA FLOW FLOWCHART

### A. Primary Data Flow
```
START
  │
  ▼
┌─────────────────────────┐
│   User submits          │
│   Google Form           │
│   (Lab Booking)         │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Data stored in        │
│   Google Sheets         │
│   (Automated)           │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   PodSync Sync Service  │
│   polls Google Sheets   │
│   (Every 5 minutes)     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   New entries found?    │─────────│   Wait for next         │
│                         │         │   sync cycle            │
└─────────────────────────┘         └─────────────────────────┘
  │ YES
  ▼
┌─────────────────────────┐
│   Parse and validate    │
│   booking data          │
│   (Date, Time, etc.)    │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Create Schedule       │
│   record in database    │
│   (schedules table)     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check if schedule     │
│   time matches current  │
│   time                  │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Schedule active now?  │─────────│   Auto trigger          │
│                         │         │   ON AIR status         │
└─────────────────────────┘         └─────────────────────────┘
  │ NO                                │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Schedule for future   │         │   Update broadcast      │
│   auto-activation       │         │   status in database    │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Notify all connected  │         │   Send status update    │
│   clients of new        │         │   to Unity Digital      │
│   schedule              │         │   Signage               │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
END                                 END
```

### B. Broadcast Control Flow
```
START: Admin Dashboard
  │
  ▼
┌─────────────────────────┐
│   Admin clicks          │
│   Broadcast Toggle      │
│   (ON AIR/OFF AIR)      │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Frontend sends        │
│   API request to        │
│   /api/status           │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Backend validates     │
│   request and checks    │
│   current status        │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check priority        │
│   system rules          │
│   (Manual > Auto)       │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Update broadcast      │
│   status in database    │
│   (broadcast_statuses)  │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Send parallel         │
│   updates to:           │
│   - Dashboard           │
│   - Unity API endpoint  │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Unity polls and       │
│   receives status       │
│   update (30s interval) │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Unity updates         │
│   display indicators    │
│   (ON AIR/OFF AIR)      │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Dashboard shows       │
│   confirmation and      │
│   updated status        │
└─────────────────────────┘
  │
  ▼
END
```

---

## 3. UNITY DIGITAL SIGNAGE FLOWCHART

### A. Unity Startup and Connection Flow
```
START: Unity Application Launch
  │
  ▼
┌─────────────────────────┐
│   Initialize            │
│   PodSync Integration   │
│   Component             │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check API Config      │
│   and Network           │
│   Connection            │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    FAIL ┌─────────────────────────┐
│   Connect to Primary    │─────────│   Try Fallback URLs     │
│   PodSync API URL       │         │   (127.0.0.1, etc.)    │
└─────────────────────────┘         └─────────────────────────┘
  │ SUCCESS                           │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Fetch initial         │         │   Connection            │
│   status and schedule   │         │   successful?           │
│   data                  │         └─────────────────────────┘
└─────────────────────────┘           │ YES    │ NO
  │                                   ▼        ▼
  ▼                         ┌─────────────────────────┐
┌─────────────────────────┐ │   Show error state      │
│   Start periodic sync   │ │   with retry timer      │
│   timers (30s/60s)      │ │   (offline mode)        │
└─────────────────────────┘ └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Display current       │         │   Retry connection      │
│   status and schedule   │         │   every 30 seconds      │
│   information           │         │                         │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Enter main update     │         │   Connection restored?  │
│   loop with real-time   │         │                         │
│   display               │         └─────────────────────────┘
└─────────────────────────┘           │ YES
  │                                   ▼
  ▼                         ┌─────────────────────────┐
END: Normal Operation       │   Resume normal         │
                           │   operation             │
                           └─────────────────────────┘
```

### B. Unity Real-time Update Flow
```
START: Unity Update Loop
  │
  ▼
┌─────────────────────────┐
│   Update current        │
│   time display          │
│   (HH:MM format)        │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Update current        │
│   date display          │
│   (Indonesian format)   │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check sync timers:    │
│   - Status: 30 seconds  │
│   - Booking: 60 seconds │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   Timer expired?        │─────────│   Continue with         │
│                         │         │   current display       │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Send API request      │         │   Check for manual      │
│   to PodSync backend    │         │   input (Space key)     │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   Response received?    │─────────│   Log error and         │
│                         │         │   keep last status      │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Parse JSON response   │         │   Manual toggle         │
│   and extract status    │         │   requested?            │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │ YES    │ NO
  ▼                                   ▼        ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Status changed from   │    YES  │   Send toggle command   │
│   previous value?       │─────────│   to PodSync API        │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Update UI elements:   │         │   Update local status   │
│   - ON AIR indicator    │         │   and display           │
│   - OFF AIR indicator   │         │                         │
│   - Status text         │         └─────────────────────────┘
└─────────────────────────┘                   │
  │                                           ▼
  ▼                               ┌─────────────────────────┐
┌─────────────────────────┐       │   Return to update      │
│   Update booking        │       │   loop                  │
│   schedule display      │       └─────────────────────────┘
│   if data available     │                   │
└─────────────────────────┘                   ▼
  │                                         END
  ▼
┌─────────────────────────┐
│   Refresh display       │
│   with new information  │
└─────────────────────────┘
  │
  ▼
END: Continue Loop
```

---

## 4. DATABASE OPERATION FLOWCHART

### A. Schedule Creation Flow
```
START: New Google Sheets Entry
  │
  ▼
┌─────────────────────────┐
│   Validate entry data:  │
│   - Required fields     │
│   - Date/time format    │
│   - Data completeness   │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    FAIL ┌─────────────────────────┐
│   Validation passed?    │─────────│   Log error and skip    │
│                         │         │   entry                 │
└─────────────────────────┘         └─────────────────────────┘
  │ SUCCESS                           │
  ▼                                   ▼
┌─────────────────────────┐         END: Entry Skipped
│   Check for duplicate   │
│   entries (timestamp +  │
│   NIP combination)      │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Duplicate found?      │─────────│   Skip duplicate        │
│                         │         │   entry                 │
└─────────────────────────┘         └─────────────────────────┘
  │ NO                                │
  ▼                                   ▼
┌─────────────────────────┐         END: Duplicate Skipped
│   Parse timestamp and   │
│   create DateTime       │
│   objects               │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Create new Schedule   │
│   record with:          │
│   - Parsed data         │
│   - Foreign key link    │
│   - Status: pending     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Save to database      │
│   with transaction      │
│   protection            │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    FAIL ┌─────────────────────────┐
│   Database save         │─────────│   Rollback transaction  │
│   successful?           │         │   and log error         │
└─────────────────────────┘         └─────────────────────────┘
  │ SUCCESS                           │
  ▼                                   ▼
┌─────────────────────────┐         END: Save Failed
│   Check if schedule     │
│   should trigger        │
│   immediate broadcast   │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Schedule time         │─────────│   Create broadcast      │
│   matches now?          │         │   status entry          │
└─────────────────────────┘         └─────────────────────────┘
  │ NO                                │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Schedule for future   │         │   Set status to         │
│   auto-activation       │         │   ON AIR                │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
END: Schedule Created               ┌─────────────────────────┐
                                  │   Notify connected      │
                                  │   Unity clients         │
                                  └─────────────────────────┘
                                    │
                                    ▼
                                  END: Broadcast Activated
```

### B. Broadcast Status Update Flow
```
START: Status Update Request
  │
  ▼
┌─────────────────────────┐
│   Identify update       │
│   source:               │
│   - Web Dashboard       │
│   - Unity Manual       │
│   - Auto Scheduler     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Get current status    │
│   from database         │
│   (last entry)          │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Apply priority rules: │
│   1. Manual (15 min)    │
│   2. System (5 min)     │
│   3. Auto (0 min)       │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   Update allowed by     │─────────│   Reject update with    │
│   priority system?      │         │   reason message        │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         END: Update Rejected
│   Create new broadcast  │
│   status entry with:    │
│   - New status          │
│   - Source identifier   │
│   - Timestamp           │
│   - Optional schedule   │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Save to database      │
│   with atomic           │
│   transaction           │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    FAIL ┌─────────────────────────┐
│   Database update       │─────────│   Return error          │
│   successful?           │         │   response              │
└─────────────────────────┘         └─────────────────────────┘
  │ SUCCESS                           │
  ▼                                   ▼
┌─────────────────────────┐         END: Update Failed
│   Send notifications    │
│   to all connected      │
│   clients via:          │
│   - WebSocket           │
│   - API polling         │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Update analytics      │
│   counters and          │
│   tracking data         │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Return success        │
│   response with         │
│   updated status        │
└─────────────────────────┘
  │
  ▼
END: Update Successful
```

---

## 5. ERROR HANDLING FLOWCHART

### A. API Connection Error Flow
```
START: API Request Failed
  │
  ▼
┌─────────────────────────┐
│   Identify error type:  │
│   - Network timeout     │
│   - Server error        │
│   - Invalid response    │
│   - Authentication     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check retry count     │
│   and error severity    │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Retryable error and   │─────────│   Try fallback URLs     │
│   under retry limit?    │         │   with exponential      │
└─────────────────────────┘         │   backoff delay         │
  │ NO                              └─────────────────────────┘
  ▼                                   │
┌─────────────────────────┐           ▼
│   Mark connection as    │         ┌─────────────────────────┐
│   failed and switch     │         │   Fallback successful?  │
│   to offline mode       │         └─────────────────────────┘
└─────────────────────────┘           │ YES    │ NO
  │                                   ▼        ▼
  ▼                         ┌─────────────────────────┐
┌─────────────────────────┐ │   Enter offline mode    │
│   Show error indicator  │ │   with error display    │
│   to user               │ └─────────────────────────┘
└─────────────────────────┘           │
  │                                   ▼
  ▼                         ┌─────────────────────────┐
┌─────────────────────────┐ │   Schedule retry        │
│   Use cached/last       │ │   attempt in 30s        │
│   known data            │ └─────────────────────────┘
└─────────────────────────┘           │
  │                                   ▼
  ▼                                 END
┌─────────────────────────┐
│   Schedule automatic    │
│   retry in background   │
└─────────────────────────┘
  │
  ▼
END: Error Handled
```

### B. Data Validation Error Flow
```
START: Invalid Data Received
  │
  ▼
┌─────────────────────────┐
│   Log detailed error    │
│   information with      │
│   context data          │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check error type:     │
│   - Format error        │
│   - Missing fields      │
│   - Invalid values      │
│   - Constraint violation│
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Critical data for     │─────────│   Use fallback/default  │
│   operation?            │         │   values where possible │
└─────────────────────────┘         └─────────────────────────┘
  │ NO                                │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Skip invalid record   │         │   Partial processing    │
│   and continue with     │         │   with available data   │
│   next data             │         │                         │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Increment error       │         │   Mark record as        │
│   counter for           │         │   partially processed  │
│   monitoring            │         │                         │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Check if error rate   │    YES  │   Alert administrator  │
│   exceeds threshold     │─────────│   of data quality       │
└─────────────────────────┘         │   issues                │
  │ NO                              └─────────────────────────┘
  ▼                                   │
┌─────────────────────────┐           ▼
│   Continue normal       │         END: Admin Notified
│   processing            │
└─────────────────────────┘
  │
  ▼
END: Error Handled
```

---

## 6. SECURITY & AUTHENTICATION FLOWCHART

### A. API Authentication Flow
```
START: API Request Received
  │
  ▼
┌─────────────────────────┐
│   Check request         │
│   headers for           │
│   authentication       │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   Valid auth token      │─────────│   Return 401            │
│   or session?           │         │   Unauthorized          │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         END: Access Denied
│   Check user            │
│   permissions for       │
│   requested resource    │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    NO   ┌─────────────────────────┐
│   Authorized for        │─────────│   Return 403            │
│   this operation?       │         │   Forbidden             │
└─────────────────────────┘         └─────────────────────────┘
  │ YES                               │
  ▼                                   ▼
┌─────────────────────────┐         END: Access Forbidden
│   Log access attempt    │
│   and process request   │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Execute authorized    │
│   operation             │
└─────────────────────────┘
  │
  ▼
END: Request Processed
```

---

## 7. PERFORMANCE MONITORING FLOWCHART

### A. System Health Check Flow
```
START: Health Check Timer (Every 30s)
  │
  ▼
┌─────────────────────────┐
│   Check database        │
│   connection status     │
│   and response time     │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Test API endpoints    │
│   response times and    │
│   availability         │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Monitor Unity         │
│   client connections   │
│   and sync status       │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Check Google Sheets   │
│   API quota and         │
│   sync performance      │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐
│   Analyze performance   │
│   metrics against       │
│   thresholds            │
└─────────────────────────┘
  │
  ▼
┌─────────────────────────┐    YES  ┌─────────────────────────┐
│   Any metrics exceed    │─────────│   Generate alert and    │
│   warning thresholds?   │         │   notify administrators │
└─────────────────────────┘         └─────────────────────────┘
  │ NO                                │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Log health status     │         │   Take corrective       │
│   and metrics to        │         │   action if possible    │
│   monitoring system     │         │   (restart services)    │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   Update system         │         │   Schedule detailed     │
│   status dashboard      │         │   diagnostic check      │
└─────────────────────────┘         └─────────────────────────┘
  │                                   │
  ▼                                   ▼
END: Health Check Complete         END: Alert Processed
```

---

This comprehensive flowchart documentation covers all major system processes, data flows, error handling, and operational procedures in the PodSync & Digital Signage Laboratorium Podcast system.