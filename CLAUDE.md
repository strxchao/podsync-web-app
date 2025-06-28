# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PodSync is a digital signage content management system for a podcast laboratory. It consists of a Node.js/Express backend with MySQL database and a React frontend with Vite. The system manages lab booking schedules, broadcast status, and digital signage content with QR code generation.

## Development Commands

### Backend (Node.js/Express)
```bash
cd backend/
npm run dev          # Start with nodemon (hot reload)
npm start            # Production start
npm run sync         # Manual Google Sheets sync
npm run test-db      # Test database connection
npm run test-connection # Test database connection (alternative)
npm run create-tables # Initialize database tables
npm run check-analytics # Verify analytics controller loads
```

### Frontend (React/Vite)
```bash
cd frontend/
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint code checking
npm run test         # Run Vitest tests
npm run test:ui      # Run Vitest with UI interface
```

### Common Development Workflow
1. Start backend: `cd backend && npm run dev` (runs on port 3002)
2. Start frontend: `cd frontend && npm run dev` (runs on port 5173)
3. Access application at http://localhost:5173

## Architecture Overview

### Backend Structure
- **Express App with Graceful Fallbacks**: `src/app.js` uses a sophisticated `safeImportController` system that provides fallback controllers if any individual controller fails to load
- **Database Models**: Uses Sequelize ORM with associations between GoogleSheetEntry, Schedule, BroadcastStatus, and SignageContent
- **Google Sheets Integration**: Automatic sync with lab booking forms via Google Sheets API
- **Broadcast Management**: Automated on-air/off-air status based on active schedules
- **QR Code Generation**: Automatic QR code creation for media URLs in signage content

### Frontend Architecture
- **React 18 with Vite**: Modern functional components with hooks
- **API Layer**: Centralized in `src/api.js` with smart fallback endpoints and enhanced error handling
- **Smart Unit Filtering**: Complex client-side filtering system for academic units with variation mapping
- **Real-time Updates**: Auto-refresh every 30 seconds on dashboard
- **Responsive Design**: Tailwind CSS with Flowbite React components

### Key System Features
1. **Resilient Backend**: Server continues running even if individual controllers fail
2. **Smart Data Synchronization**: Google Sheets ↔ MySQL with conflict resolution
3. **Automated Broadcast Control**: Auto on/off based on schedule activity
4. **Unit/Department Support**: Maps various unit name variations to standard names
5. **QR Code Integration**: Auto-generates QR codes for media URLs in content

### Database Schema
- `signage_content`: Digital signage content with QR codes
- `schedules`: Lab booking schedules (derived from Google Sheets)
- `broadcast_statuses`: Broadcast status history with optional schedule references
- `google_sheet_entries`: Raw Google Sheets data

### API Endpoints
Backend provides RESTful API at `/api/*` with comprehensive fallback support:
- `/api/content/*` - Content management with QR generation
- `/api/schedule/*` - Schedule management with unit filtering
- `/api/status/*` - Broadcast status control
- `/api/sync/*` - Google Sheets synchronization
- `/api/analytics/*` - System analytics and charts

## Environment Setup

### Backend Environment (.env)
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=podsync_db
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
PORT=3002
```

### Frontend Environment (.env)
```
VITE_API_URL=http://localhost:3002
```

## Code Architecture Notes

### Backend Error Handling
The backend uses a unique "safe fallback" pattern where each controller is wrapped in `safeImportController()` in `src/app.js:63`. If any controller fails to load, it provides a working fallback that returns mock data instead of crashing the server. This ensures the server remains operational even with missing dependencies or broken controllers.

### Frontend API Integration
The frontend API layer (`src/api.js`) includes:
- Smart endpoint fallbacks (tries multiple endpoints if primary fails)
- Complex unit filtering with variation mapping
- Enhanced error logging and debugging with emojis and detailed request/response logging
- Automatic response structure normalization
- Axios interceptors for comprehensive request/response monitoring

### Unit/Department Mapping
The system handles various academic unit name variations through a mapping system in `frontend/src/api.js`. Units like "Teknik Informatika", "D4 TRM", "S1 TRM" are all mapped to standardized names.

### Google Sheets Integration
The system syncs with Google Forms responses stored in Google Sheets. The sync process:
1. Fetches new entries every 5 minutes
2. Parses multiple date/time formats
3. Creates/updates Schedule records
4. Handles duplicate detection and conflict resolution

## Testing

### Backend Testing
- Use `/health` endpoint to verify server status and feature availability
- Use `npm run test-db` to verify database connection
- Use `npm run test-connection` as alternative database test
- Use `npm run check-analytics` to verify analytics controller loads
- Check individual API endpoints via browser or curl

### Frontend Testing
- Use browser dev tools to monitor API calls with enhanced logging
- Check console for detailed API request/response logging with emojis
- Verify responsive design across different screen sizes
- Run `npm run test` for Vitest unit tests
- Run `npm run test:ui` for interactive test UI

## Common Issues

### Database Connection
If database connection fails, the backend will continue running in "fallback mode" with mock data.

### Google Sheets API
Service account credentials must be properly configured. Check `service-account.json` file exists and permissions are set correctly.

### Port Conflicts
Backend runs on 3002, frontend on 5173. If ports are in use, update accordingly in environment files and package.json proxy settings.