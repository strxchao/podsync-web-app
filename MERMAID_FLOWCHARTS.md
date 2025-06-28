# MERMAID FLOWCHARTS UNTUK PODSYNC

## 1. SYSTEM ARCHITECTURE FLOWCHART

```mermaid
graph TD
    GF[Google Forms] --> GS[Google Sheets]
    
    subgraph Backend
        API[API Gateway]
        SC[Safe Controller]
        CC[Content Controller]
        SCHC[Schedule Controller] 
        STC[Status Controller]
        DB[(MySQL Database)]
    end
    
    subgraph Frontend
        WEB[React App]
        DASH[Dashboard]
        SCHED[Schedule Page]
        CONT[Content Page]
    end
    
    UNITY[Unity Display]
    
    GS --> API
    API --> SC
    SC --> CC
    SC --> SCHC
    SC --> STC
    
    CC --> DB
    SCHC --> DB
    STC --> DB
    
    WEB --> API
    WEB --> DASH
    WEB --> SCHED
    WEB --> CONT
    
    API --> UNITY
```

## 2. USER FLOW FLOWCHART

```mermaid
flowchart TD
    START([User Starts]) --> LOGIN{User Type?}
    
    LOGIN -->|Admin| DASHBOARD[Admin Dashboard]
    LOGIN -->|Public| VIEW[Public View]
    
    DASHBOARD --> CHOOSE{Choose Action}
    CHOOSE -->|Content| CONTENT[Manage Content]
    CHOOSE -->|Schedule| SCHEDULE[View Schedule]
    CHOOSE -->|Broadcast| BROADCAST[Control Broadcast]
    CHOOSE -->|Analytics| ANALYTICS[View Analytics]
    
    CONTENT --> CREATE[Create Content]
    CREATE --> QR{Add Media?}
    QR -->|Yes| GENERATE[Generate QR Code]
    QR -->|No| SAVE[Save Content]
    GENERATE --> SAVE
    
    SCHEDULE --> FILTER[Filter by Unit]
    SCHEDULE --> SYNC[Sync Google Sheets]
    SYNC --> UPDATE[Update Database]
    
    BROADCAST --> TOGGLE[Toggle On/Off]
    TOGGLE --> NOTIFY[Notify Unity]
    
    ANALYTICS --> STATS[View Statistics]
    STATS --> EXPORT[Export Report]
    
    VIEW --> CURRENT[Current Schedule]
    VIEW --> STATUS[Broadcast Status]
    
    SAVE --> END([End])
    UPDATE --> END
    NOTIFY --> END
    EXPORT --> END
    CURRENT --> END
    STATUS --> END
```

## 3. DATA FLOW FLOWCHART

```mermaid
graph LR
    subgraph Input
        FORMS[Google Forms]
        ADMIN[Admin Input]
    end
    
    subgraph Processing
        SHEETS[Google Sheets]
        SYNC[Sync Service]
        PARSER[Data Parser]
    end
    
    subgraph Storage
        RAW[Raw Data]
        PROCESSED[Processed Data]
        CONTENT[Content Data]
        STATUS[Status Data]
    end
    
    subgraph Output
        WEB[Web Dashboard]
        API[REST API]
        DISPLAY[Unity Display]
    end
    
    FORMS --> SHEETS
    SHEETS --> SYNC
    SYNC --> PARSER
    PARSER --> RAW
    RAW --> PROCESSED
    ADMIN --> CONTENT
    ADMIN --> STATUS
    
    PROCESSED --> API
    CONTENT --> API
    STATUS --> API
    
    API --> WEB
    API --> DISPLAY
```

## 4. SYSTEM INTEGRATION FLOWCHART

```mermaid
graph TB
    subgraph External
        GF[Google Forms]
        GS[Google Sheets]
        GSA[Google Sheets API]
    end
    
    subgraph Backend
        CORS[CORS Handler]
        SC[Safe Controller]
        SS[Sync Service]
        BS[Broadcast Service]
        CS[Content Service]
        ORM[Database ORM]
        DB[(MySQL)]
    end
    
    subgraph Frontend
        ROUTER[React Router]
        PAGES[Page Components]
        AXIOS[HTTP Client]
    end
    
    subgraph Unity
        APP[Unity App]
        HTTP[HTTP Client]
        CACHE[Local Cache]
    end
    
    GF --> GS
    GS --> GSA
    GSA --> SS
    
    SS --> ORM
    BS --> ORM
    CS --> ORM
    ORM --> DB
    
    CORS --> SC
    SC --> SS
    SC --> BS
    SC --> CS
    
    AXIOS --> CORS
    ROUTER --> PAGES
    PAGES --> AXIOS
    
    HTTP --> CORS
    APP --> HTTP
    HTTP --> CACHE
```

## 5. DEPLOYMENT ARCHITECTURE FLOWCHART

```mermaid
graph TD
    subgraph Development
        DEV_FE[Vite Dev Server]
        DEV_BE[Node.js Server]
        DEV_DB[(Local MySQL)]
        DEV_UNITY[Unity Editor]
    end
    
    subgraph Production
        NGINX[Nginx Proxy]
        PM2[PM2 Manager]
        PROD_BE[Express Server]
        PROD_DB[(Production MySQL)]
        STATIC[Static Files]
    end
    
    subgraph External
        GOOGLE[Google API]
        CDN[Content CDN]
    end
    
    subgraph Unity
        UNITY_BUILD[Unity Build]
        DISPLAY[Display Device]
        CACHE[Local Cache]
    end
    
    DEV_FE --> DEV_BE
    DEV_BE --> DEV_DB
    DEV_UNITY --> DEV_BE
    
    NGINX --> STATIC
    NGINX --> PROD_BE
    PM2 --> PROD_BE
    PROD_BE --> PROD_DB
    
    PROD_BE --> GOOGLE
    STATIC --> CDN
    
    UNITY_BUILD --> DISPLAY
    DISPLAY --> NGINX
    DISPLAY --> CACHE
```

## 6. SIMPLE PROJECT OVERVIEW

```mermaid
graph TD
    A[User submits Google Form] --> B[Data stored in Google Sheets]
    B --> C[PodSync syncs data every 5 minutes]
    C --> D[Data processed and stored in MySQL]
    D --> E[Admin manages content via React dashboard]
    E --> F[Broadcast status controlled manually or automatically]
    F --> G[Unity display shows real-time information]
    G --> H[QR codes generated for media content]
    H --> I[Analytics dashboard shows usage statistics]
```

---

## CARA PENGGUNAAN

1. **Copy kode Mermaid** yang diinginkan (tanpa markdown header)
2. **Buka** https://mermaid.live
3. **Paste kode** ke editor
4. **Render diagram** akan otomatis muncul
5. **Export** sebagai PNG/SVG

## KETERANGAN FLOWCHARTS

1. **System Architecture**: Arsitektur sistem yang disederhanakan
2. **User Flow**: Alur penggunaan yang mudah dipahami
3. **Data Flow**: Alur data dari input ke output
4. **System Integration**: Integrasi komponen utama
5. **Deployment Architecture**: Deployment development vs production
6. **Simple Project Overview**: Overview keseluruhan project

Semua flowchart sudah **disederhanakan** dengan menghilangkan detail yang tidak perlu untuk fokus pada alur utama sistem PodSync.