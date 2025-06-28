# PodSync Admin Panel

Modern React.js admin panel for PodSync - a comprehensive content management system for podcast laboratory digital signage with real-time broadcast control and advanced analytics.

## 🌟 Features

### Core Functionality
- **Real-time Dashboard** - Live system metrics and broadcast status monitoring
- **Broadcast Control Center** - Intuitive on-air/off-air toggle with visual feedback
- **Schedule Management** - View and manage lab booking schedules with advanced filtering
- **Content Management** - Full CRUD operations for digital signage content
- **QR Code Integration** - Automatic QR code generation and management for media URLs
- **Advanced Analytics** - Comprehensive system analytics with data visualization

### User Experience
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Real-time Updates** - Auto-refresh every 30 seconds for live data
- **Error Handling** - Graceful error states with user-friendly messages
- **Loading States** - Smooth loading indicators and skeleton screens
- **Interactive UI** - Modern animations and hover effects
- **Dark Mode Ready** - Prepared for dark/light theme switching

## 🛠️ Tech Stack

### Frontend Framework
- **React.js 18** - Modern functional components with hooks
- **Vite** - Lightning-fast build tool and development server
- **React Router Dom** - Client-side routing with nested routes

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite React** - Professional UI components library
- **Custom Components** - Hand-crafted components for specific needs

### HTTP & API
- **Axios** - Promise-based HTTP client with interceptors
- **Custom API Layer** - Comprehensive API methods with error handling

### Development Tools
- **ESLint** - Code linting and style enforcement
- **PostCSS** - CSS processing with Autoprefixer
- **Hot Module Replacement** - Instant updates during development

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (recommended v20+)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:3002`

### Installation

1. **Clone and Navigate**
```bash
git clone https://github.com/strxchao/podsync-web-app.git
cd podsync-web-app/frontend
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create `.env` file in the frontend root:
```env
# Backend API URL
VITE_API_URL=http://localhost:3002

# Development settings
VITE_NODE_ENV=development
```

4. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

5. **Access Application**
- **Local**: http://localhost:5173
- **Network**: http://your-ip:5173 (for testing on mobile devices)

## 📱 Application Pages

### 🏠 Dashboard (`/`)
**Main overview with key metrics**
- **Broadcast Control Center** - Large, intuitive on-air/off-air toggle
- **System Statistics** - Total schedules, signage content, studio status
- **Quick Actions** - Navigate to schedules, content management, sync data
- **Real-time Updates** - Auto-refresh every 30 seconds

### 📅 Schedule (`/schedule`)
**Lab booking schedule management**
- **Data Table** - Paginated display of Google Sheets entries
- **Advanced Filtering** - Search by name, NIP, purpose with date filters
- **Real-time Sync** - Manual sync button with status indicators
- **Responsive Pagination** - Smart pagination with quick jump
- **Export Capabilities** - Data export in multiple formats

### 🎨 Signage Content (`/signage-content`)
**Digital signage content management**
- **Content CRUD** - Full create, read, update, delete operations
- **QR Code Management** - Automatic generation, regeneration, and preview
- **Media URL Integration** - Link media content with automatic QR generation
- **Content Types** - Announcement, promotion, schedule, and custom types
- **Status Management** - Active/inactive content control
- **Preview Modes** - Live preview of QR codes and content

### 📊 Analytics (`/analytics`)
**Comprehensive system analytics**
- **Dashboard Overview** - Key performance indicators and trends
- **Time Range Selection** - 24h, 7d, 30d analytics periods
- **System Metrics** - Memory usage, uptime, database health
- **Activity Feed** - Recent system activity and changes
- **Export Analytics** - Download reports in JSON or CSV format

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── podsync_icon.svg           # Application icon
│   ├── podsync_logo.svg           # Application logo
│   └── index.html                 # HTML template
├── src/
│   ├── components/
│   │   └── Navbar.jsx             # Navigation component with responsive design
│   ├── pages/
│   │   ├── Dashboard.jsx          # Main dashboard with broadcast control
│   │   ├── Schedule.jsx           # Schedule management with filtering
│   │   ├── SignageContent.jsx     # Content management with QR codes
│   │   └── Analytics.jsx          # Advanced analytics dashboard
│   ├── App.jsx                    # Main application component with routing
│   ├── main.jsx                   # Application entry point
│   ├── index.css                  # Global styles and Tailwind imports
│   └── api.js                     # Comprehensive API layer
├── .env                           # Environment variables
├── .env.local                     # Local environment overrides
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration with proxy
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
└── README.md                      # This file
```

## 🔌 API Integration

### Base Configuration
The admin panel communicates with the backend through a centralized API layer:

```javascript
// Automatic base URL detection
const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? ''  // Vite proxy handles /api in development
    : `http://${window.location.hostname}:3002`,
  timeout: 10000,
  withCredentials: true
});
```

### API Methods
Comprehensive API methods with error handling:

```javascript
// Dashboard statistics
await apiMethods.getDashboardStats();

// Broadcast control
await apiMethods.updateBroadcastStatus({ 
  isOnAir: true, 
  statusMessage: 'Live broadcast'
});

// Content management with QR codes
await apiMethods.createContent({
  title: 'New Content',
  mediaUrl: 'https://example.com/video',
  // QR code automatically generated
});

// Advanced analytics
await apiMethods.getAnalytics('7d');
```

### Error Handling
Robust error handling with fallback mechanisms:
- **Network Errors** - User-friendly error messages
- **API Timeouts** - Automatic retry mechanisms
- **Server Errors** - Graceful degradation with fallback data
- **Validation Errors** - Field-specific error displays

## 🎨 Component Architecture

### Reusable Components
- **CleanToggleSwitch** - Custom broadcast toggle with animations
- **ErrorBoundary** - Global error catching and recovery
- **LoadingSpinner** - Consistent loading indicators
- **NotificationSystem** - Toast notifications for user feedback

### Page Components
Each page is a self-contained component with:
- **State Management** - Local state with hooks
- **Effect Hooks** - Data fetching and real-time updates
- **Error Handling** - Page-specific error states
- **Loading States** - Skeleton screens and spinners

### Styling Approach
- **Utility-First** - Tailwind CSS for rapid development
- **Component Variants** - Consistent design system
- **Responsive Design** - Mobile-first breakpoints
- **Accessibility** - ARIA labels and keyboard navigation

## 🚀 Development

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally  
npm run preview

# Lint code for style and errors
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Development Features
- **Hot Module Replacement** - Instant updates without refresh
- **Proxy Configuration** - Seamless backend API integration
- **Error Overlay** - Development error visualization
- **Source Maps** - Debug production builds
- **Network Debugging** - Detailed request/response logging

### Backend Integration
Ensure the backend is running before starting frontend development:

```bash
# Terminal 1 - Backend
cd backend/
npm run dev

# Terminal 2 - Frontend
cd frontend/  
npm run dev
```

## 📦 Production Build

### Build Process
```bash
# Create optimized production build
npm run build

# Output directory: dist/
# - Minified JavaScript and CSS
# - Optimized images and assets
# - Service worker ready
# - Source maps for debugging
```

### Build Optimization
- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Remove unused code
- **Asset Optimization** - Compressed images and fonts
- **Bundle Analysis** - Size optimization and dependency analysis

### Deployment Options

#### Static Hosting (Recommended)
```bash
# Build the project
npm run build

# Deploy dist/ folder to:
# - Vercel, Netlify, GitHub Pages
# - AWS S3 + CloudFront
# - Firebase Hosting
```

#### Docker Deployment
```dockerfile
# Multi-stage build for optimal size
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Server Configuration
For single-page application routing:

**Nginx:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Configuration

### Environment Variables
```env
# Required
VITE_API_URL=http://localhost:3002

# Optional
VITE_NODE_ENV=development
VITE_ENABLE_ANALYTICS=true
VITE_REFRESH_INTERVAL=30000
VITE_DEFAULT_PAGINATION=10
```

### Vite Configuration
```javascript
// vite.config.js highlights
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        // Detailed logging for development
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['flowbite-react']
        }
      }
    }
  }
});
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Dashboard loads with correct metrics
- [ ] Broadcast toggle functions properly  
- [ ] Schedule filtering and pagination work
- [ ] Content creation with QR generation
- [ ] Analytics data displays correctly
- [ ] Responsive design on mobile devices
- [ ] Error states display appropriately

### Performance Testing
- **Lighthouse Score** - Aim for 90+ in all categories
- **Bundle Size** - Monitor chunk sizes and dependencies
- **Loading Times** - Test on slow network connections
- **Memory Usage** - Check for memory leaks in long sessions

## 🚨 Troubleshooting

### Common Issues

**Backend Connection Issues:**
```bash
# Check if backend is running
curl http://localhost:3002/health

# Verify proxy configuration
npm run dev -- --debug

# Check environment variables
echo $VITE_API_URL
```

**Build Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**Performance Issues:**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/assets
```

### Debug Mode
Enable detailed logging by setting:
```javascript
// In development
localStorage.setItem('debug', 'podsync:*');
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/awesome-feature`)
3. **Follow** coding standards and component patterns
4. **Test** across different screen sizes and browsers
5. **Submit** pull request with detailed description

### Code Standards
- **ESLint** - Follow existing linting rules
- **Component Structure** - Use functional components with hooks
- **Naming Conventions** - PascalCase for components, camelCase for functions
- **File Organization** - Group related functionality together
- **Comments** - JSDoc for complex functions

### UI Guidelines
- **Accessibility** - Include ARIA labels and keyboard navigation
- **Responsive Design** - Test on mobile, tablet, and desktop
- **Performance** - Optimize images and minimize re-renders
- **User Experience** - Provide loading states and error feedback

## 📈 Performance Optimization

### Bundle Optimization
- **Code Splitting** - Automatic route-based splitting implemented
- **Lazy Loading** - Dynamic imports for heavy components
- **Tree Shaking** - Unused code elimination
- **Compression** - Gzip/Brotli compression for production

### Runtime Performance
- **React.memo** - Prevent unnecessary re-renders
- **useMemo/useCallback** - Memoize expensive computations
- **Intersection Observer** - Lazy load images and content
- **Virtual Scrolling** - For large data tables

## Developer About
- Name: Muhammad Habib Yusuf
- Instagram: @habibyusuf_
- Email: mhabibyusuf224@gmail.com

### Project Purpose
This project is intended to complete the final assignment, with this web application users will be able to manage the digital signage content of the Faculty of Applied Sciences podcast laboratory well.

**Built with ⚡ React + Vite for modern podcast laboratory management**