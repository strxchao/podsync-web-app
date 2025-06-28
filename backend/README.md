# PodSync Backend

Advanced backend service for PodSync digital signage CMS, managing podcast laboratory schedules, broadcast automation, and content distribution with real-time synchronization.

## 🚀 Features

### Core Functionality
- **Real-time Google Sheets Integration** - Automatic sync with lab booking forms
- **Broadcast Management System** - Automated on-air/off-air status with schedule integration
- **Digital Signage Content Management** - Full CRUD operations with QR code generation
- **Advanced Analytics Dashboard** - Comprehensive system metrics and usage statistics
- **RESTful API** - Complete endpoints for Unity frontend and React admin panel integration

### Advanced Features
- **Automatic QR Code Generation** - Auto-generated QR codes for media URLs
- **Broadcast Automation** - Smart auto on/off air based on active schedules
- **Fallback Systems** - Graceful degradation when services are unavailable
- **Error Recovery** - Robust error handling with detailed logging
- **Real-time Status Updates** - Live broadcast status monitoring

## 📋 Prerequisites

- **Node.js** v18+ (recommended v20+)
- **MySQL** v8.0+ or MariaDB v10.5+
- **Google Sheets API** credentials (service account)
- **Memory**: Minimum 512MB RAM
- **Storage**: 2GB free space

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/strxchao/podsync-web-app.git
cd podsync-web-app/backend
npm install
```

### 2. Environment Configuration
Create `.env` file from template:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=podsync_db

# Google Sheets API Credentials
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Server Configuration
PORT=3002
NODE_ENV=development

# Security (Optional)
JWT_SECRET=your-super-secret-key
```

### 3. Database Setup
```bash
# Test database connection
npm run test-db

# Alternative connection test
npm run test-connection

# Create database tables (manual)
# Connect to MySQL and run the SQL scripts from the main README.md
```

### 4. Google Sheets Setup
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Download credentials JSON
5. Share your Google Sheet with the service account email
6. Copy credentials to `.env` file

### 5. Start the Server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Manual sync with Google Sheets
npm run sync

# Check analytics controller
npm run check-analytics
```

## 📡 API Documentation

### 🎯 Health Check
```http
GET /health
```
Returns server status and database connectivity.

### 📅 Schedule Management
```http
GET    /api/schedule                    # Get all schedules (paginated)
GET    /api/schedule/today             # Get today's schedule
GET    /api/schedule/active            # Get currently active schedules
POST   /api/schedule/sync              # Force sync with Google Sheets
GET    /api/schedule/sync/status       # Get sync status
PATCH  /api/schedule/:id/status        # Update schedule status
```

### 📡 Broadcast Management
```http
GET    /api/status                     # Get current broadcast status
POST   /api/status                     # Update broadcast status (manual override)
GET    /api/status/history             # Get broadcast status history
GET    /api/status/manager             # Get broadcast manager status
POST   /api/status/toggle-auto         # Toggle automatic mode on/off
GET    /api/status/upcoming            # Get upcoming schedule warnings
```

### 🎨 Content Management
```http
GET    /api/content/active             # Get all active content
GET    /api/content                    # Get all content (including inactive)
GET    /api/content/:id               # Get content by ID
POST   /api/content                    # Create new content (auto-generates QR)
PUT    /api/content/:id               # Update content (regenerates QR if needed)
DELETE /api/content/:id               # Delete content
PATCH  /api/content/display-order      # Update display order
POST   /api/content/:id/regenerate-qr  # Regenerate QR code
GET    /api/content/stats              # Get content statistics
GET    /api/content/by-date            # Get content by date range
```

### 📊 Analytics & Metrics
```http
GET    /api/analytics/dashboard        # Comprehensive dashboard stats
GET    /api/analytics/system           # System performance metrics
GET    /api/analytics/export           # Export analytics data (JSON/CSV)
```

### 🔄 Sync Management
```http
POST   /api/sync                       # Trigger manual data sync
GET    /api/sync/status                # Get synchronization status
GET    /api/sync/entries               # Get all Google Sheets entries
GET    /api/sync/entries/today         # Get today's entries
GET    /api/sync/entries/range         # Get entries by date range
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # Database connection & configuration
│   ├── controllers/
│   │   ├── analyticsController.js   # Analytics & dashboard stats
│   │   ├── contentController.js     # Content & QR code management
│   │   ├── scheduleController.js    # Schedule operations
│   │   ├── statusController.js      # Broadcast status management
│   │   └── syncController.js        # Google Sheets synchronization
│   ├── middleware/
│   │   ├── errorHandler.js          # Centralized error handling
│   │   └── validateRequest.js       # Request validation
│   ├── models/
│   │   ├── BroadcastStatus.js       # Broadcast status model
│   │   ├── GoogleSheetEntry.js      # Google Sheets data model
│   │   ├── Schedule.js              # Schedule management model
│   │   ├── SignageContent.js        # Content management model
│   │   └── index.js                 # Model associations & sync
│   ├── routes/
│   │   ├── analytics.js             # Analytics endpoints
│   │   ├── content.js               # Content management routes
│   │   ├── schedule.js              # Schedule routes
│   │   ├── status.js                # Broadcast status routes
│   │   └── sync.js                  # Sync management routes
│   ├── services/
│   │   ├── broadcastManager.js      # Automated broadcast control
│   │   ├── googleSheets.js          # Google Sheets API integration
│   │   └── scheduler.js             # Background sync scheduler
│   ├── scripts/
│   │   ├── initDb.js                # Database initialization
│   │   ├── manualSync.js            # Manual data synchronization
│   │   ├── testConnection.js        # Connection diagnostics
│   │   └── checkTableStructure.js   # Database verification
│   └── app.js                       # Express application setup
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies & scripts
└── README.md                        # This file
```

## 🔧 Database Schema

### Key Tables
- **`signage_content`** - Digital signage content with QR codes
- **`schedules`** - Lab booking schedules (derived from Google Sheets)
- **`broadcast_statuses`** - Broadcast status history
- **`google_sheet_entries`** - Raw Google Sheets data

### Relationships
- `BroadcastStatus` → `Schedule` (optional foreign key)
- `Schedule` → `GoogleSheetEntry` (optional foreign key)

## 🤖 Automation Features

### Broadcast Manager
- **Auto On-Air**: Automatically sets broadcast ON when active schedule detected
- **Auto Off-Air**: Sets broadcast OFF when no active schedules
- **Schedule Completion**: Marks schedules as completed when time expires
- **Manual Override**: Allows manual control while preserving automation

### Google Sheets Sync
- **Automatic Sync**: Every 5 minutes (configurable)
- **Smart Parsing**: Handles multiple date/time formats
- **Error Recovery**: Continues operation even if sync fails
- **Conflict Resolution**: Updates existing entries, creates new ones

## 📊 Advanced Analytics

The analytics system provides:
- **Content Metrics**: Total, active, media usage, creation trends
- **Schedule Analytics**: Completion rates, booking patterns
- **Broadcast Statistics**: Session tracking, on-air time, utilization
- **System Performance**: Memory usage, database health, uptime
- **Recent Activity**: Real-time activity feed

## 🚨 Error Handling

### Graceful Degradation
- **Database Offline**: Returns fallback data, continues serving requests
- **Google Sheets Unavailable**: Uses cached data, logs for retry
- **Service Failures**: Individual service failures don't crash the server

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Human-readable description",
  "details": "Technical details or validation errors",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: No sensitive data in error responses  
- **Rate Limiting**: API request throttling (configurable)
- **CORS Protection**: Configurable cross-origin policies
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries

## 🚀 Development

### Development Mode
```bash
npm run dev          # Start with nodemon (hot reload)
npm run test-db      # Test database connection
npm run sync         # Trigger manual Google Sheets sync
npm run check-analytics # Verify analytics controller loads
```

### Testing
```bash
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Database Operations
```bash
npm run test-db      # Test database connection
npm run test-connection # Alternative connection test
# Database setup requires manual SQL execution
# See main README.md for complete SQL scripts
```

## 📦 Production Deployment

### Docker Deployment (Recommended)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

### Traditional Deployment
```bash
# Set production environment
export NODE_ENV=production

# Install production dependencies
npm ci --only=production

# Test database connection
npm run test-db

# Start server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_SSL=true
PORT=3002
# ... other production configs
```

## 📈 Monitoring & Health Checks

### Health Endpoint
```http
GET /health
```
Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected",
  "features": {
    "analytics": "available",
    "broadcastManager": "running",
    "qrCodeGeneration": "active"
  }
}
```

### System Metrics
Access real-time system metrics via `/api/analytics/system`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Use ESLint configuration
- Follow existing patterns
- Add JSDoc comments for functions
- Include error handling
- Write tests for new features

## Developer About
- Name: Muhammad Habib Yusuf
- Instagram: @habibyusuf_
- Email: mhabibyusuf224@gmail.com

### Project Purpose
This project is intended to complete the final assignment, with this web application users will be able to manage the digital signage content of the Faculty of Applied Sciences podcast laboratory well.

For questions and support:
- **Issues**: GitHub Issues
- **Documentation**: See `/docs` folder
- **API Testing**: Use `/health` endpoint for connectivity tests

---