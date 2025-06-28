import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:3002'
    : `http://${window.location.hostname}:3002`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Request interceptor with enhanced logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    console.log('Response Data Preview:', 
      typeof response.data === 'object' && response.data !== null 
        ? Object.keys(response.data).slice(0, 5) 
        : typeof response.data
    );
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.error(
        `Network Error: Backend server might not be running on ${error.config?.baseURL}`
      );
    } else if (error.response?.status === 404) {
      console.error('API Endpoint not found:', error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error('Server Error:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// SMART UNITS MAPPING - Complete mapping
const unitsMapping = {
  'S1 Terapan Teknologi Rekayasa Multimedia': [
    'S1 Terapan Teknologi Rekayasa Multimedia',
    'D4 Teknologi Rekayasa Multimedia', 
    'Teknologi Rekayasa Multimedia',
    'D4 TRM',
    'S1 TRM',
    'TRM',
    'Trm',
  ],
  'S1 Terapan Sistem Informasi Kota Cerdas': [
    'S1 Terapan Sistem Informasi Kota Cerdas',
    'D4 Sistem Informasi Kota Cerdas',
    'D4 SIKC', 
  ],
  'D3 Teknologi Telekomunikasi': [
    'D3 Teknologi Telekomunikasi',
    'D3 TT',
    'TT',
  ],
  'D3 Rekayasa Perangkat Lunak Aplikasi': [
    'D3 Rekayasa Perangkat Lunak Aplikasi',
    'D3 RPLA',
  ],
  'D3 Sistem Informasi Akuntansi': [
    'D3 Sistem Informasi Akuntansi',
    'D3 SIA',
    'Sistem Informasi Akuntansi',
  ],
  'D3 Teknik Informatika': [
    'D3 Teknik Informatika',
    'D3 TI',
  ],
  'D3 Teknik Komputer': [
    'D3 Teknik Komputer',
    'D3 TK',
  ],
  'D3 Perhotelan': [
    'D3 Perhotelan',
    'D3 Perhotelan dan Pariwisata',
    'D3 Perhotelan Pariwisata',
  ],
  'D3 Manajemen Pemasaran': [
    'D3 Manajemen Pemasaran',
    'D3 Manajemen Pemasaran Digital',
    'D3 MP',
  ]
};

// Helper function to get all registered units
const getAllRegisteredUnits = () => {
  const allUnits = [];
  Object.values(unitsMapping).forEach(variations => {
    allUnits.push(...variations);
  });
  return allUnits;
};

// ENHANCED: Smart unit matching function
const matchesUnitFilter = (entryUnit, selectedUnit) => {
  if (!entryUnit || !selectedUnit) return false;
  
  const entryUnitLower = entryUnit.toLowerCase().trim();
  
  if (selectedUnit === 'Others') {
    // For "Others", check if unit is NOT in any registered variations
    const registeredUnits = getAllRegisteredUnits();
    return !registeredUnits.some(regUnit => 
      entryUnitLower.includes(regUnit.toLowerCase()) ||
      regUnit.toLowerCase().includes(entryUnitLower) ||
      entryUnitLower === regUnit.toLowerCase()
    );
  } else {
    // For specific units, check against all variations
    const unitVariations = unitsMapping[selectedUnit] || [selectedUnit];
    return unitVariations.some(variation => {
      const variationLower = variation.toLowerCase();
      return entryUnitLower.includes(variationLower) ||
             variationLower.includes(entryUnitLower) ||
             entryUnitLower === variationLower;
    });
  }
};

// ENHANCED: getSyncEntries with smart filtering support
const getSyncEntries = async (params = {}) => {
  try {
    console.log('Enhanced getSyncEntries with smart filtering:', params);
    
    // Extract smart filter parameters
    const { 
      smartUnit, // Our custom parameter
      ...regularParams 
    } = params;
    
    // Build query string with regular parameters only
    const queryString = new URLSearchParams(regularParams).toString();
    const url = `/api/sync/entries${queryString ? `?${queryString}` : ''}`;
    
    console.log('API URL:', url);
    console.log('Smart Unit Filter:', smartUnit);
    
    // Make API call
    const response = await api.get(url);
    
    // Apply client-side smart filtering if needed
    if (smartUnit && response.data) {
      console.log('Applying client-side smart filtering...');
      
      let entriesData = [];
      let originalTotal = 0;
      let originalPages = 1;
      let currentPage = 1;
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        entriesData = response.data;
        originalTotal = response.data.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        entriesData = response.data.data;
        originalTotal = response.data.total || 0;
        originalPages = response.data.pages || 1;
        currentPage = response.data.currentPage || 1;
      } else if (response.data.rows && Array.isArray(response.data.rows)) {
        entriesData = response.data.rows;
        originalTotal = response.data.count || 0;
        originalPages = Math.ceil((response.data.count || 0) / (regularParams.limit || 10));
        currentPage = parseInt(regularParams.page) || 1;
      }
      
      console.log(`Original data: ${entriesData.length} entries`);
      
      // Apply smart filtering
      const filteredEntries = entriesData.filter(entry => {
        const matches = matchesUnitFilter(entry.unit_prodi, smartUnit);
        if (matches) {
          console.log(`Match found: "${entry.unit_prodi}" matches "${smartUnit}"`);
        }
        return matches;
      });
      
      console.log(`After smart filtering: ${filteredEntries.length} entries`);
      console.log(`Filter details:`, {
        selectedUnit: smartUnit,
        variations: smartUnit !== 'Others' ? unitsMapping[smartUnit] : ['All unregistered units'],
        matchedEntries: filteredEntries.length
      });
      
      // For client-side filtering, we need to handle pagination differently
      const limit = parseInt(regularParams.limit) || 10;
      const page = parseInt(regularParams.page) || 1;
      
      // Calculate new pagination
      const newTotal = filteredEntries.length;
      const newPages = Math.ceil(newTotal / limit);
      
      // Apply pagination to filtered results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
      
      console.log(`Pagination applied: showing ${paginatedEntries.length} of ${newTotal} filtered entries`);
      
      // Update response structure
      if (Array.isArray(response.data)) {
        response.data = paginatedEntries;
      } else {
        response.data = {
          ...response.data,
          data: paginatedEntries,
          total: newTotal,
          pages: newPages,
          currentPage: page,
          originalTotal: originalTotal,
          filtered: true,
          filterType: 'smartUnit',
          filterValue: smartUnit
        };
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('Error in enhanced getSyncEntries:', error);
    throw error;
  }
};

// Enhanced content methods
const contentMethods = {
  getSignageContent: async (activeOnly = false) => {
    try {
      console.log('Fetching signage content, activeOnly:', activeOnly);
      
      const endpoints = [
        '/api/content',
        '/api/content/active',
        '/api/signage-content'
      ];
      
      let response = null;
      let usedEndpoint = null;
      
      const primaryEndpoint = activeOnly ? '/api/content/active' : '/api/content';
      
      try {
        console.log(`Using primary endpoint: ${primaryEndpoint}`);
        response = await api.get(primaryEndpoint);
        usedEndpoint = primaryEndpoint;
        console.log(`Success with primary endpoint: ${primaryEndpoint}`);
      } catch (primaryError) {
        console.log(`Primary endpoint failed: ${primaryEndpoint}`, primaryError.response?.status);
        
        for (const endpoint of endpoints) {
          if (endpoint === primaryEndpoint) continue;
          
          try {
            console.log(`Trying fallback endpoint: ${endpoint}`);
            response = await api.get(endpoint);
            usedEndpoint = endpoint;
            console.log(`Success with fallback endpoint: ${endpoint}`);
            break;
          } catch (err) {
            console.log(`Failed endpoint: ${endpoint}`, err.response?.status);
            continue;
          }
        }
      }
      
      if (!response) {
        throw new Error('All content endpoints failed');
      }
      
      console.log('API Response from', usedEndpoint, ':', response.status);
      console.log('Raw response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      let contentsData = [];
      
      if (Array.isArray(response.data)) {
        contentsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        contentsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.rows)) {
        contentsData = response.data.rows;
      } else if (response.data && Array.isArray(response.data.contents)) {
        contentsData = response.data.contents;
      } else {
        console.warn('Unexpected response structure:', response.data);
        contentsData = [];
      }
      
      console.log(`Extracted ${contentsData.length} content items`);
      
      // Normalize field names for frontend compatibility
      contentsData = contentsData.map((item, index) => {
        const normalized = {
          ...item,
          id: item.id || item._id || `temp-${index}`,
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : 
                   (item.is_active !== undefined ? Boolean(item.is_active) : true),
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : 
                    (item.isActive !== undefined ? Boolean(item.isActive) : true),
          mediaUrl: item.mediaUrl || item.media_url || '',
          media_url: item.media_url || item.mediaUrl || '',
          qrCodeUrl: item.qrCodeUrl || item.qr_code_url || '',
          qr_code_url: item.qr_code_url || item.qrCodeUrl || '',
          createdAt: item.createdAt || item.created_at,
          created_at: item.created_at || item.createdAt,
          updatedAt: item.updatedAt || item.updated_at,
          updated_at: item.updated_at || item.updatedAt,
          createdBy: item.createdBy || item.created_by || 'system',
          created_by: item.created_by || item.createdBy || 'system',
          displayOrder: item.displayOrder || item.display_order || 0,
          display_order: item.display_order || item.displayOrder || 0
        };
        
        if (index < 2) {
          console.log(`Normalized item ${index}:`, {
            id: normalized.id,
            title: normalized.title,
            isActive: normalized.isActive,
            is_active: normalized.is_active,
            mediaUrl: normalized.mediaUrl?.substring(0, 30) + '...'
          });
        }
        
        return normalized;
      });
      
      if (activeOnly) {
        const beforeFilter = contentsData.length;
        contentsData = contentsData.filter(item => item.isActive || item.is_active);
        console.log(`Filtered from ${beforeFilter} to ${contentsData.length} active contents`);
      }
      
      console.log(`Final result: ${contentsData.length} content items`);
      
      return {
        ...response,
        data: contentsData
      };
      
    } catch (error) {
      console.error('Error fetching signage content:', error);
      throw error;
    }
  },

  createContent: async (data) => {
    try {
      console.log('Creating new content:', data);
      
      const contentData = {
        title: data.title,
        description: data.description,
        type: data.type || 'announcement',
        mediaUrl: data.mediaUrl || null,
        displayOrder: data.displayOrder || 0,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        createdBy: data.createdBy || 'admin',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
      };
      
      console.log('Sending to backend:', contentData);
      
      let response;
      try {
        response = await api.post('/api/content', contentData);
        console.log('Content created successfully via /api/content');
      } catch (primaryError) {
        console.log('Primary endpoint failed, trying fallback...');
        response = await api.post('/api/signage-content', contentData);
        console.log('Content created successfully via fallback endpoint');
      }
      
      console.log('Backend response:', response.data);
      return response;
      
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  updateContent: async (id, data) => {
    try {
      console.log(`Updating content ${id}:`, data);
      
      const contentData = {
        title: data.title,
        description: data.description,
        type: data.type,
        mediaUrl: data.mediaUrl || null,
        displayOrder: data.displayOrder || 0,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        createdBy: data.createdBy || 'admin',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
      };
      
      console.log('Sending to backend for update:', {
        id: id,
        isActive: contentData.isActive,
        title: contentData.title
      });
      
      let response;
      try {
        response = await api.put(`/api/content/${id}`, contentData);
        console.log('Content updated successfully via /api/content');
      } catch (primaryError) {
        console.log('Primary endpoint failed, trying fallback...');
        response = await api.put(`/api/signage-content/${id}`, contentData);
        console.log('Content updated successfully via fallback endpoint');
      }
      
      console.log('Backend response:', {
        status: response.status,
        id: response.data?.id,
        title: response.data?.title,
        isActive: response.data?.isActive,
        is_active: response.data?.is_active
      });
      
      return response;
      
    } catch (error) {
      console.error('Error updating content:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  regenerateQRCode: async (contentId) => {
    try {
      console.log(`Regenerating QR code for content ${contentId}`);
      
      let response;
      try {
        response = await api.post(`/api/content/${contentId}/regenerate-qr`);
        console.log('QR code regenerated successfully via /api/content');
      } catch (primaryError) {
        console.log('Primary endpoint failed, trying fallback...');
        response = await api.post(`/api/signage-content/${contentId}/regenerate-qr`);
        console.log('QR code regenerated successfully via fallback endpoint');
      }
      
      console.log('QR regeneration response:', response.data);
      return response;
      
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw error;
    }
  }
};

// Enhanced API methods with better debugging
export const apiMethods = {
  // Chart data methods
  getChartData: async (timeRange = '30d', chartType = 'all') => {
    try {
      console.log(`Fetching chart data: timeRange=${timeRange}, chartType=${chartType}`);
      
      const params = new URLSearchParams({
        timeRange,
        chartType
      });
      
      const url = `/api/analytics/charts?${params}`;
      console.log(`Full URL: ${api.defaults.baseURL}${url}`);
      
      const response = await api.get(url);
      
      console.log('Chart data response:', {
        status: response.status,
        dataType: typeof response.data,
        hasChartData: !!(response.data?.chartData),
        keys: response.data ? Object.keys(response.data) : null
      });
      
      let chartData = response.data?.chartData || response.data;
      
      const defaultData = {
        daily: [],
        weekly: [],
        monthly: [],
        facilities: [],
        units: [],
        peakHours: []
      };
      
      chartData = { ...defaultData, ...chartData };
      
      console.log('Final chart data structure:', {
        daily: chartData.daily?.length || 0,
        weekly: chartData.weekly?.length || 0,
        monthly: chartData.monthly?.length || 0,
        facilities: chartData.facilities?.length || 0,
        units: chartData.units?.length || 0,
        peakHours: chartData.peakHours?.length || 0
      });
      
      return chartData;
      
    } catch (error) {
      console.error('Error fetching chart data:', error);
      
      const dummyData = {
        daily: [
          { date: '2025-06-01', sessions: 15, hours: 25, users: 8 },
          { date: '2025-06-02', sessions: 22, hours: 38, users: 12 },
          { date: '2025-06-03', sessions: 18, hours: 32, users: 10 },
          { date: '2025-06-04', sessions: 25, hours: 45, users: 15 },
          { date: '2025-06-05', sessions: 20, hours: 35, users: 11 }
        ],
        weekly: [
          { week: '2025-05-26', sessions: 85, hours: 150, users: 35 },
          { week: '2025-06-02', sessions: 95, hours: 175, users: 42 }
        ],
        monthly: [
          { month: '2025-05', sessions: 320, hours: 580, users: 125 },
          { month: '2025-06', sessions: 180, hours: 325, users: 77 }
        ],
        facilities: [
          { name: 'Studio Podcast', sessions: 45, hours: 85 },
          { name: 'Ruang Meeting', sessions: 32, hours: 58 },
          { name: 'Lab Multimedia', sessions: 28, hours: 52 }
        ],
        units: [
          { name: 'Teknik Informatika', sessions: 35, hours: 65, users: 18 },
          { name: 'Sistem Informasi', sessions: 28, hours: 48, users: 15 },
          { name: 'Multimedia', sessions: 22, hours: 42, users: 12 }
        ],
        peakHours: [
          { hour: 8, sessions: 5 },
          { hour: 9, sessions: 12 },
          { hour: 10, sessions: 18 },
          { hour: 11, sessions: 15 },
          { hour: 13, sessions: 22 },
          { hour: 14, sessions: 20 },
          { hour: 15, sessions: 16 }
        ]
      };
      
      console.log('Using dummy data due to API error');
      return dummyData;
    }
  },

  getAnalytics: async (timeRange = '7d') => {
    try {
      console.log(`Fetching analytics: timeRange=${timeRange}`);
      
      const response = await api.get(`/api/analytics/dashboard?timeRange=${timeRange}`);
      
      console.log('Analytics response:', {
        status: response.status,
        hasData: !!response.data,
        keys: response.data ? Object.keys(response.data) : null
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      return {
        timeRange,
        content: { 
          total: 12, 
          active: 8, 
          withMedia: 6, 
          recentlyCreated: 2,
          mediaPercentage: 50
        },
        schedule: { 
          total: 45, 
          completed: 28, 
          ongoing: 5, 
          pending: 12, 
          completionRate: 62,
          todaySchedules: 3
        },
        broadcast: { 
          totalSessions: 18, 
          totalOnTimeHours: 156.5, 
          averageSessionHours: 8.7, 
          currentlyOnAir: false,
          sessionTrend: 'increasing'
        },
        entries: { 
          total: 234, 
          thisWeek: 28, 
          trend: 'increasing', 
          weeklyGrowth: 15
        },
        recentActivity: [
          {
            type: 'content',
            action: 'updated',
            title: 'Weekly Podcast Schedule',
            timestamp: new Date().toISOString(),
            details: 'Content "Weekly Podcast Schedule" was updated'
          },
          {
            type: 'broadcast',
            action: 'off_air',
            title: 'Broadcast ended',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Broadcast status: Session ended',
            updatedBy: 'system'
          }
        ],
        note: 'Using fallback data - API connection failed'
      };
    }
  },

  getSystemMetrics: async () => {
    try {
      console.log('Fetching system metrics...');
      
      const response = await api.get('/api/analytics/system');
      
      console.log('System metrics response:', {
        status: response.status,
        hasData: !!response.data
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      
      return {
        system: {
          uptime: 3600,
          uptimeFormatted: '1h 0m 0s',
          memory: { used: 128, total: 512, percentage: 25 },
          nodeVersion: 'v18.0.0',
          platform: 'win32'
        },
        database: {
          status: 'unknown',
          responseTime: -1,
          tables: { 
            signageContent: 12, 
            schedules: 45, 
            broadcastStatuses: 8, 
            googleSheetEntries: 234 
          }
        },
        note: 'Mock data - API connection failed'
      };
    }
  },

  // Test connection method
  testConnection: async () => {
    try {
      console.log('Testing API connection...');
      
      const response = await api.get('/health');
      
      console.log('Connection test successful:', response.status);
      return true;
      
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  testDatabase: async () => {
    try {
      console.log('Testing database connection...');
      
      const response = await api.get('/api/analytics/system');
      
      const isHealthy = response.data?.database?.status === 'healthy';
      console.log(isHealthy ? 'Database is healthy' : 'Database issues detected');
      
      return isHealthy;
      
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  },

  // Content methods
  getSignageContent: contentMethods.getSignageContent,
  createContent: contentMethods.createContent,
  updateContent: contentMethods.updateContent,
  regenerateQRCode: contentMethods.regenerateQRCode,

  // ENHANCED: getSyncEntries with smart filtering
  getSyncEntries: getSyncEntries,

  // Dashboard stats with Unity integration
  getDashboardStats: async () => {
    try {
      console.log('Fetching dashboard stats...');
      
      const [schedules, status, unityStatus, content, syncEntries] = await Promise.all([
        api.get('/api/sync/entries?page=1&limit=1').catch(() => ({ data: { total: 0 } })),
        api.get('/api/status').catch(() => ({ data: { is_on_air: false, isOnAir: false } })),
        api.get('/api/broadcast/unity/status').catch(() => ({ data: { onAir: false } })),
        api.get('/api/signage-content').catch(() => ({ data: [] })),
        api.get('/api/schedule').catch(() => ({ data: { total: 0 } }))
      ]);
      
      let totalSchedules = schedules.data?.total || syncEntries.data?.total || 0;
      let totalSignageContent = Array.isArray(content.data) ? content.data.length : 0;
      
      // Prioritize Unity broadcast status for consistency
      const isOnAir = unityStatus.data?.onAir ?? status.data?.is_on_air ?? status.data?.isOnAir ?? false;
      
      const result = {
        totalSchedules,
        isOnAir,
        totalSignageContent,
        statusSource: unityStatus.data?.onAir !== undefined ? 'unity-broadcast' : 'legacy-status'
      };
      
      console.log('Dashboard stats with Unity integration:', result);
      return result;
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalSchedules: 0,
        isOnAir: false,
        totalSignageContent: 0,
        statusSource: 'fallback'
      };
    }
  },

  // All other existing methods
  getSchedules: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/schedule${queryString ? `?${queryString}` : ''}`);
  },
  
  getTodaySchedule: () => api.get('/api/schedule/today'),
  getActiveSchedules: () => api.get('/api/schedule/active'),
  
  getSyncStatus: () => api.get('/api/sync/status'),
  triggerSync: () => api.post('/api/sync'),

  getBroadcastStatus: async () => {
    try {
      const response = await api.get('/api/status');
      const data = response.data;
      return {
        ...response,
        data: {
          ...data,
          isOnAir: data.is_on_air || data.isOnAir || false,
          statusMessage: data.status_message || data.statusMessage || 'Unknown',
          updatedBy: data.updated_by || data.updatedBy || 'system',
          lastUpdated: data.last_updated || data.lastUpdated || new Date()
        }
      };
    } catch (error) {
      console.error('Error fetching broadcast status:', error);
      throw error;
    }
  },
  
  updateBroadcastStatus: async (data) => {
    try {
      const backendData = {
        isOnAir: data.isOnAir,
        statusMessage: data.statusMessage,
        updatedBy: data.updatedBy || 'admin',
        manualOverride: data.manualOverride || false
      };
      
      // Update both endpoints for synchronization
      const promises = [
        api.post('/api/status', backendData), // Original status endpoint
        api.post('/api/broadcast/unity/status', { // Unity broadcast endpoint  
          onAir: data.isOnAir,
          source: `web-app-${data.updatedBy || 'admin'}`
        })
      ];
      
      const results = await Promise.allSettled(promises);
      
      // Log results for debugging
      results.forEach((result, index) => {
        const endpoint = index === 0 ? '/api/status' : '/api/broadcast/unity/status';
        if (result.status === 'fulfilled') {
          console.log(`✅ ${endpoint} updated successfully`);
        } else {
          console.error(`❌ ${endpoint} update failed:`, result.reason);
        }
      });
      
      // Return the primary result (status endpoint)
      return results[0].status === 'fulfilled' ? results[0].value : Promise.reject(results[0].reason);
      
    } catch (error) {
      console.error('Error updating broadcast status:', error);
      throw error;
    }
  },

  // New method specifically for Unity synchronization
  updateUnityBroadcastStatus: async (data) => {
    try {
      const response = await api.post('/api/broadcast/unity/status', {
        onAir: data.onAir,
        source: data.source || 'web-app'
      });
      console.log('✅ Unity broadcast status updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Error updating Unity broadcast status:', error);
      throw error;
    }
  },

  // New method to get Unity broadcast status
  getUnityBroadcastStatus: async () => {
    try {
      const response = await api.get('/api/broadcast/unity/status');
      console.log('✅ Unity broadcast status fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching Unity broadcast status:', error);
      throw error;
    }
  }
};

export default api;