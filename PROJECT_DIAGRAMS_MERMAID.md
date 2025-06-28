# PROJECT PODSYNC - MERMAID DIAGRAMS

## 1. PROJECT OVERVIEW DIAGRAM

```mermaid
graph TD
    A[PodSync Project] --> B[Digital Signage Management]
    A --> C[Lab Booking System]
    A --> D[Broadcast Control]
    
    B --> E[Content Management]
    B --> F[QR Code Generation]
    B --> G[Unity Display]
    
    C --> H[Google Sheets Integration]
    C --> I[Schedule Management]
    C --> J[Unit Filtering]
    
    D --> K[Auto On/Off Control]
    D --> L[Manual Override]
    D --> M[Status History]
    
    E --> N[Create/Edit Content]
    F --> O[Auto Generate for Media]
    G --> P[Real-time Display]
    
    H --> Q[Auto Sync Every 5min]
    I --> R[Calendar View]
    J --> S[Program Studi Filter]
    
    K --> T[Schedule-based]
    L --> U[Admin Control]
    M --> V[Audit Trail]
```

## 2. TECHNOLOGY STACK DIAGRAM

```mermaid
graph LR
    subgraph Frontend
        A[React 18]
        B[Vite Build Tool]
        C[Tailwind CSS]
        D[Flowbite Components]
        E[Axios HTTP Client]
    end
    
    subgraph Backend
        F[Node.js 18+]
        G[Express.js Framework]
        H[Sequelize ORM]
        I[Google Sheets API]
        J[Safe Controller System]
    end
    
    subgraph Database
        K[MySQL 8.0]
        L[4 Main Tables]
        M[Foreign Key Relations]
        N[Soft Delete Support]
    end
    
    subgraph External
        O[Google Forms]
        P[Google Sheets]
        Q[Unity Engine]
        R[QR Code Service]
    end
    
    A --> F
    B --> A
    C --> A
    D --> A
    E --> F
    
    F --> H
    G --> F
    H --> K
    I --> P
    J --> G
    
    K --> L
    L --> M
    M --> N
    
    O --> P
    P --> I
    Q --> F
    R --> G
```

## 3. DATABASE ENTITY RELATIONSHIP DIAGRAM

```mermaid
erDiagram
    google_sheet_entries {
        int id PK
        date timestamp
        varchar nama_lengkap
        varchar nip_kode_dosen_nim
        varchar unit_prodi
        varchar keperluan_peminjaman
        date tanggal_mulai_peminjaman
        time jam_mulai
        time jam_berakhir
        timestamp created_at
        timestamp deleted_at
    }
    
    schedules {
        int id PK
        varchar title
        text description
        date date
        time start_time
        time end_time
        enum status
        varchar location
        varchar organizer
        int google_sheet_entry_id FK
        timestamp created_at
    }
    
    broadcast_statuses {
        int id PK
        boolean is_on_air
        varchar status_message
        varchar updated_by
        date last_updated
        int schedule_id FK
        timestamp created_at
    }
    
    signage_content {
        int id PK
        varchar title
        text description
        text content
        enum type
        text media_url
        text qr_code_url
        int display_order
        boolean is_active
        date start_date
        date end_date
        varchar created_by
        timestamp created_at
    }
    
    google_sheet_entries ||--o{ schedules : "generates"
    schedules ||--o{ broadcast_statuses : "tracks"
```

## 4. APPLICATION ARCHITECTURE DIAGRAM

```mermaid
graph TB
    subgraph "External Data Sources"
        GF[Google Forms]
        GS[Google Sheets]
    end
    
    subgraph "PodSync Backend"
        subgraph "API Layer"
            CORS[CORS Middleware]
            AUTH[Authentication]
            ROUTES[Route Handlers]
        end
        
        subgraph "Controller Layer"
            CC[Content Controller]
            SC[Schedule Controller]
            STC[Status Controller]
            SYC[Sync Controller]
            AC[Analytics Controller]
        end
        
        subgraph "Service Layer"
            GSS[Google Sheets Service]
            BS[Broadcast Service]
            QRS[QR Code Service]
            AS[Analytics Service]
        end
        
        subgraph "Data Layer"
            ORM[Sequelize ORM]
            MODELS[Data Models]
            DB[(MySQL Database)]
        end
        
        subgraph "Safe Fallback System"
            SFC[Safe Controller Import]
            FB[Fallback Controllers]
        end
    end
    
    subgraph "Frontend Application"
        subgraph "React Components"
            NAV[Navigation]
            DASH[Dashboard]
            SCHED[Schedule Page]
            CONT[Content Page]
            ANAL[Analytics Page]
        end
        
        subgraph "API Integration"
            AXI[Axios Client]
            INT[Interceptors]
            ERR[Error Handling]
        end
    end
    
    subgraph "Unity Display"
        UA[Unity Application]
        HTTP[HTTP Client]
        CACHE[Local Cache]
        RENDER[Content Renderer]
    end
    
    GF --> GS
    GS --> GSS
    
    CORS --> ROUTES
    AUTH --> ROUTES
    ROUTES --> CC
    ROUTES --> SC
    ROUTES --> STC
    ROUTES --> SYC
    ROUTES --> AC
    
    CC --> QRS
    SC --> GSS
    STC --> BS
    SYC --> GSS
    AC --> AS
    
    GSS --> ORM
    BS --> ORM
    QRS --> ORM
    AS --> ORM
    
    ORM --> MODELS
    MODELS --> DB
    
    SFC --> CC
    SFC --> SC
    SFC --> STC
    SFC --> SYC
    SFC --> AC
    FB --> SFC
    
    AXI --> CORS
    INT --> AXI
    ERR --> AXI
    
    NAV --> AXI
    DASH --> AXI
    SCHED --> AXI
    CONT --> AXI
    ANAL --> AXI
    
    HTTP --> CORS
    UA --> HTTP
    HTTP --> CACHE
    CACHE --> RENDER
```

## 5. USER INTERACTION FLOW DIAGRAM

```mermaid
sequenceDiagram
    participant U as User
    participant GF as Google Forms
    participant GS as Google Sheets
    participant PS as PodSync Backend
    participant DB as MySQL Database
    participant FE as React Frontend
    participant UN as Unity Display
    
    Note over U,UN: Lab Booking Process
    U->>GF: Submit booking form
    GF->>GS: Store form data
    
    Note over GS,DB: Auto Sync Process
    PS->>GS: Fetch new data (every 5min)
    GS->>PS: Return form responses
    PS->>DB: Process and store data
    
    Note over FE,UN: Admin Management
    U->>FE: Access admin dashboard
    FE->>PS: Request schedule data
    PS->>DB: Query schedules
    DB->>PS: Return schedule data
    PS->>FE: Send JSON response
    FE->>U: Display schedule
    
    Note over PS,UN: Broadcast Control
    U->>FE: Toggle broadcast status
    FE->>PS: Update broadcast API
    PS->>DB: Update status
    PS->>UN: Notify status change
    UN->>U: Display updated status
    
    Note over FE,UN: Content Management
    U->>FE: Create signage content
    FE->>PS: Submit content data
    PS->>PS: Generate QR code
    PS->>DB: Store content
    PS->>UN: Push new content
    UN->>U: Display new content
```

## 6. DATA PROCESSING FLOW DIAGRAM

```mermaid
flowchart TD
    subgraph "Data Input"
        A[Google Forms Submission]
        B[Admin Manual Input]
    end
    
    subgraph "Data Collection"
        C[Google Sheets Storage]
        D[Auto Sync Service]
    end
    
    subgraph "Data Processing"
        E[Parse Form Data]
        F[Validate Fields]
        G[Map Unit Names]
        H[Generate Schedules]
    end
    
    subgraph "Data Storage"
        I[Raw Form Data Table]
        J[Processed Schedule Table]
        K[Content Table]
        L[Status Table]
    end
    
    subgraph "Data Output"
        M[REST API Endpoints]
        N[React Dashboard]
        O[Unity Display]
        P[Analytics Reports]
    end
    
    A --> C
    B --> K
    B --> L
    
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    
    H --> I
    H --> J
    
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N
    M --> O
    M --> P
    
    classDef input fill:#ffcdd2
    classDef collection fill:#c8e6c9
    classDef processing fill:#bbdefb
    classDef storage fill:#fff9c4
    classDef output fill:#f8bbd9
    
    class A,B input
    class C,D collection
    class E,F,G,H processing
    class I,J,K,L storage
    class M,N,O,P output
```

## 7. SYSTEM COMPONENTS DIAGRAM

```mermaid
graph TD
    subgraph "Core Features"
        A[Schedule Management]
        B[Content Management]
        C[Broadcast Control]
        D[Analytics Dashboard]
    end
    
    subgraph "Integration Features"
        E[Google Sheets Sync]
        F[Unity Display Integration]
        G[QR Code Generation]
        H[Real-time Updates]
    end
    
    subgraph "Technical Features"
        I[Safe Fallback System]
        J[Error Handling]
        K[API Rate Limiting]
        L[Database Optimization]
    end
    
    subgraph "User Features"
        M[Responsive UI]
        N[Unit Filtering]
        O[Search Functionality]
        P[Export Capabilities]
    end
    
    A --> E
    A --> N
    A --> O
    
    B --> G
    B --> F
    B --> M
    
    C --> H
    C --> F
    C --> I
    
    D --> P
    D --> L
    D --> M
    
    E --> I
    E --> J
    
    F --> H
    F --> I
    
    G --> B
    H --> C
    
    I --> J
    J --> K
    K --> L
    
    M --> N
    N --> O
    O --> P
```

## 8. DEPLOYMENT ARCHITECTURE DIAGRAM

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development]
        B[Vite Dev Server:5173]
        C[Node.js Server:3002]
        D[MySQL Local]
    end
    
    subgraph "Production Environment"
        E[Production Server]
        F[Nginx Reverse Proxy]
        G[PM2 Process Manager]
        H[Node.js Application]
        I[MySQL Production]
        J[Static Files]
    end
    
    subgraph "External Services"
        K[Google Sheets API]
        L[CDN for Media]
        M[SSL Certificate]
    end
    
    subgraph "Unity Deployment"
        N[Unity Build]
        O[Display Hardware]
        P[Local Cache]
    end
    
    A --> B
    A --> C
    C --> D
    
    E --> F
    F --> M
    F --> J
    F --> G
    G --> H
    H --> I
    
    H --> K
    J --> L
    
    N --> O
    O --> P
    O --> F
    
    classDef dev fill:#e3f2fd
    classDef prod fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef unity fill:#fce4ec
    
    class A,B,C,D dev
    class E,F,G,H,I,J prod
    class K,L,M external
    class N,O,P unity
```

## 9. PROJECT TIMELINE DIAGRAM

```mermaid
gantt
    title PodSync Development Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Project Concept          :done, concept, 2025-04-01, 2025-04-05
    Requirements Analysis    :done, req, 2025-04-05, 2025-04-10
    Database Design         :done, db, 2025-04-10, 2025-04-15
    
    section Backend Development
    Express Server Setup    :done, server, 2025-04-15, 2025-04-20
    API Controllers        :done, api, 2025-04-20, 2025-05-05
    Google Sheets Integration :done, sheets, 2025-05-05, 2025-05-15
    Safe Fallback System   :done, fallback, 2025-05-15, 2025-05-20
    
    section Frontend Development
    React App Setup        :done, react, 2025-04-25, 2025-05-01
    Dashboard Components   :done, dash, 2025-05-01, 2025-05-10
    Schedule Management    :done, sched, 2025-05-10, 2025-05-20
    Content Management     :done, content, 2025-05-20, 2025-05-30
    
    section Integration
    Unity Display Setup    :done, unity, 2025-05-25, 2025-06-05
    QR Code Generation     :done, qr, 2025-06-01, 2025-06-05
    Analytics Dashboard    :done, analytics, 2025-06-05, 2025-06-15
    
    section Testing
    Unit Testing          :done, test, 2025-06-10, 2025-06-18
    Integration Testing   :done, integration, 2025-06-15, 2025-06-22
    User Acceptance Testing :active, uat, 2025-06-18, 2025-06-24
    
    section Documentation
    Technical Documentation :active, tech-doc, 2025-06-20, 2025-06-24
    User Manual           :active, manual, 2025-06-22, 2025-06-24
```

## 10. FEATURE BREAKDOWN DIAGRAM

```mermaid
mindmap
  root)PodSync Features(
    Schedule Management
      Google Sheets Sync
        Auto Sync Every 5min
        Conflict Resolution
        Error Handling
      Calendar View
        Today Schedule
        Date Range Filter
        Unit Filter
      Search & Filter
        By Unit/Program
        By Date Range
        By Status
    
    Content Management
      CRUD Operations
        Create Content
        Edit Content
        Delete Content
      Media Support
        Image Upload
        Video Support
        QR Code Generation
      Scheduling
        Start/End Dates
        Active/Inactive
        Display Order
    
    Broadcast Control
      Manual Control
        On/Off Toggle
        Status Override
        Admin Control
      Auto Control
        Schedule Based
        Time Based
        Smart Detection
      History Tracking
        Status Changes
        Admin Actions
        Audit Trail
    
    Unity Integration
      Real-time Display
        Content Updates
        Status Updates
        Schedule Display
      Offline Support
        Local Cache
        Fallback Content
        Auto Recovery
      Performance
        60fps Rendering
        Smooth Transitions
        Memory Management
    
    Analytics
      Dashboard Stats
        Usage Metrics
        Peak Hours
        Popular Units
      System Health
        Performance Metrics
        Error Tracking
        Uptime Monitoring
      Reports
        Export PDF/Excel
        Custom Date Range
        Unit Statistics
```

---

## CARA PENGGUNAAN

Untuk menggunakan diagram-diagram di atas:

1. **Copy kode Mermaid** yang diinginkan (dimulai dari ````mermaid` hingga ````)
2. **Buka** https://mermaid.live 
3. **Paste kode** ke editor
4. **Render diagram** akan otomatis muncul
5. **Export** sebagai PNG/SVG sesuai kebutuhan

## KETERANGAN

- **Graph TD/LR**: Top-Down atau Left-Right flow
- **Flowchart**: Advanced flowchart dengan berbagai shapes
- **SequenceDiagram**: Menampilkan interaksi antar sistem
- **ErDiagram**: Entity Relationship untuk database
- **Gantt**: Timeline project development
- **Mindmap**: Feature breakdown dalam bentuk mind map

Setiap diagram menggunakan **color coding** dan **styling** untuk memudahkan pemahaman struktur project PodSync.