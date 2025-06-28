# PodSync - Digital Signage Content Management System

![PodSync Logo](frontend/public/podsync_logo.svg)

A comprehensive digital signage content management system designed for podcast laboratory environments. PodSync integrates web-based administration with Unity-powered digital displays to provide real-time information management and broadcast control.

## 🎯 Overview

PodSync is a modern web application that streamlines laboratory management through automated scheduling, broadcast control, and digital signage content management. The system integrates seamlessly with Google Workspace and provides real-time updates through Unity-powered displays.

### Key Features

- **📅 Automated Schedule Management**: Sync with Google Sheets for real-time booking updates
- **📺 Digital Signage Control**: Unity-powered displays with QR code generation
- **🔴 Broadcast Management**: Automated and manual on-air/off-air control
- **📊 Analytics Dashboard**: Comprehensive usage statistics and reporting
- **🔧 Safe Fallback System**: Innovative error handling for maximum uptime
- **⚡ Real-time Updates**: 30-second sync intervals for live information

## 🏗️ Architecture

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

## 🚀 Technology Stack

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework for RESTful APIs
- **Sequelize ORM** - Database abstraction layer
- **MySQL 8.0** - Relational database
- **Google Sheets API v4** - Data synchronization
- **QRCode Library** - Dynamic QR code generation

### Frontend
- **React 18** - Modern UI library with functional components
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite React** - Component library
- **Axios** - HTTP client with interceptors

### Digital Signage
- **Unity 2022.3 LTS** - Real-time rendering engine
- **UnityWebRequest** - HTTP communication
- **JSON Utility** - Data serialization
- **Coroutines** - Asynchronous operations

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Unity 2022.3 LTS (for digital signage)
- Google Workspace account
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/strxchao/podsync-web-app.git
   cd podsync-web-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Google Sheets credentials
   ```

4. **Database setup**
   ```bash
   npm run create-tables
   npm run test-db
   ```

5. **Start development server**
   ```bash
   npm run dev  # Development with hot reload
   npm start    # Production start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:3002" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev  # Runs on http://localhost:5173
   ```

### Unity Digital Signage Setup

1. **Open Unity project**
   - Open Unity Hub
   - Add project from `/unity-signage` directory
   - Ensure Unity 2022.3 LTS is installed

2. **Configure API endpoint**
   - Open `IntegratedBookingDisplayManager.cs`
   - Update `apiBaseUrl` to your backend URL

3. **Build and deploy**
   - Build for your target platform
   - Deploy to display hardware

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=podsync_db

# Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Server Configuration
PORT=3002
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
```

### Google Sheets API Setup

1. **Create Google Cloud Project**
   - Go to Google Cloud Console
   - Create new project or select existing

2. **Enable Google Sheets API**
   - Navigate to APIs & Services
   - Enable Google Sheets API v4

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create service account
   - Download JSON key file as `service-account.json`

4. **Share spreadsheet with service account**
   - Open your Google Sheet
   - Share with service account email
   - Grant editor permissions

## 📖 API Documentation

### Authentication
All API endpoints are currently open access. Future versions will include authentication.

### Core Endpoints

#### Schedule Management
```
GET    /api/schedule              # Get all schedules
GET    /api/schedule/today        # Get today's schedules
POST   /api/schedule              # Create new schedule
PUT    /api/schedule/:id          # Update schedule
DELETE /api/schedule/:id          # Delete schedule
```

#### Content Management
```
GET    /api/content               # Get all content
POST   /api/content               # Create new content
PUT    /api/content/:id           # Update content
DELETE /api/content/:id           # Delete content
```

#### Broadcast Control
```
GET    /api/status                # Get current broadcast status
POST   /api/status/toggle         # Toggle broadcast status
POST   /api/status/set            # Set specific status
```

#### Synchronization
```
POST   /api/sync/manual           # Trigger manual sync
GET    /api/sync/status           # Get sync status
```

#### Analytics
```
GET    /api/analytics/dashboard   # Get dashboard statistics
GET    /api/analytics/usage       # Get usage analytics
GET    /api/analytics/export      # Export analytics data
```

## 🎮 Unity Integration

The Unity digital signage component provides real-time display capabilities:

### Features
- **Real-time Data Display**: 30-second update intervals
- **Offline Support**: Local caching for network interruptions
- **QR Code Display**: Dynamic QR code rendering
- **Broadcast Status**: Visual on-air/off-air indicators
- **Schedule Information**: Current and upcoming bookings

### Integration Code Example
```csharp
public class IntegratedBookingDisplayManager : MonoBehaviour
{
    [Header("API Configuration")]
    public string apiBaseUrl = "http://localhost:3002/api";
    public float updateInterval = 30f;
    
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
            yield return new WaitForSeconds(updateInterval);
        }
    }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test-db        # Test database connection
npm run test-connection # Alternative connection test
npm run check-analytics # Verify analytics controller
```

### Frontend Testing
```bash
cd frontend
npm run test           # Run Vitest tests
npm run test:ui        # Interactive test UI
npm run lint           # ESLint checking
```

### Manual Testing
- Access health endpoint: `http://localhost:3002/health`
- Test API endpoints using tools like Postman or curl
- Monitor browser console for frontend errors

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   
   # Start application with PM2
   pm2 start src/app.js --name "podsync-backend"
   pm2 startup
   pm2 save
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Serve with nginx or deploy to CDN
   # Configure nginx to serve build files and proxy API requests
   ```

3. **Database Optimization**
   - Configure MySQL for production workload
   - Set up automated backups
   - Implement monitoring

### Environment-Specific Configuration
- **Development**: Hot reload, debug logging, local database
- **Production**: Process management, optimized builds, SSL certificates

## 🔒 Security Considerations

- **API Security**: Implement rate limiting and input validation
- **Database Security**: Use connection pooling and prepared statements
- **Service Account**: Secure Google Sheets API credentials
- **HTTPS**: Enable SSL certificates in production
- **CORS**: Configure appropriate CORS policies

## 🐛 Troubleshooting

### Common Issues

**Database Connection Fails**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Test connection manually
npm run test-db
```

**Google Sheets Sync Fails**
- Verify service account credentials
- Check spreadsheet sharing permissions
- Validate GOOGLE_SHEETS_SPREADSHEET_ID

**Unity Display Not Updating**
- Check API endpoint configuration
- Verify network connectivity
- Monitor Unity console for errors

**Frontend Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Performance Optimization

- **Database**: Indexed queries, connection pooling
- **API**: Response caching, compression middleware
- **Frontend**: Code splitting, lazy loading
- **Unity**: 60fps rendering, efficient memory management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Use semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Habib Yusuf** - *Lead Developer* - [@strxchao](https://github.com/strxchao)

## 🙏 Acknowledgments

- Fakultas Ilmu Terapan, Universitas Telkom
- Laboratory Podcast team for testing and feedback
- Open source community for amazing tools and libraries

## 📞 Support

For support, email mhabibyusuf224@gmail.com or create an issue in this repository.

---

**Built with ❤️ for podcast laboratory management**