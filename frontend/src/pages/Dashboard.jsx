import { Card, Alert, Spinner, Button } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { apiMethods } from '../api.js';

// Simple and Clean Toggle Switch Component
const CleanToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Toggle Switch Container */}
      <div
        className={`relative w-72 h-20 rounded-2xl cursor-pointer transition-all duration-500 ease-in-out ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
        } ${
          checked
            ? 'bg-gradient-to-r from-red-500 to-red-600'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}
        onClick={!disabled ? onChange : undefined}
      >
        {/* Status Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">
            <div className="text-white/90 text-sm font-medium mb-1">On Air Status:</div>
            <div className="text-xl font-bold">
              {checked ? 'On Air' : 'Off Air'}
            </div>
          </div>
        </div>

        {/* Toggle Handle */}
        <div
          className={`absolute top-2 w-16 h-16 bg-white rounded-xl shadow-lg transition-all duration-500 ease-out ${
            checked ? 'translate-x-52' : 'translate-x-2'
          }`}
        >
          {/* Handle Inner Dot */}
          <div className="w-full h-full rounded-xl flex items-center justify-center">
            <div 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                checked ? 'bg-red-500' : 'bg-gray-400'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            checked ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`}
        ></div>
        <span className="text-gray-600 text-sm font-medium">
          {checked ? 'Broadcasting Live' : 'Studio Offline'}
        </span>
      </div>
    </div>
  );
};

export function Dashboard() {
  const [stats, setStats] = useState({
    totalSchedules: 0,
    isOnAir: false,
    totalSignageContent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastUpdateStatus, setBroadcastUpdateStatus] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dashboardStats = await apiMethods.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard data. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcastStatusChange = async () => {
    try {
      setBroadcastLoading(true);
      setBroadcastUpdateStatus('Updating...');
      setError(null);
      
      const newStatus = !stats.isOnAir;
      console.log('🔄 Dashboard toggle: current =', stats.isOnAir, ', new =', newStatus);
      
      await apiMethods.updateBroadcastStatus({ 
        isOnAir: newStatus,
        statusMessage: newStatus ? 'On Air from Dashboard' : 'Off Air from Dashboard',
        updatedBy: 'admin'
      });
      
      // Force refresh dashboard stats to get latest Unity status
      console.log('🔄 Refreshing dashboard stats after toggle...');
      const refreshedStats = await apiMethods.getDashboardStats();
      console.log('📊 Refreshed stats:', refreshedStats);
      setStats(refreshedStats);
      
      setBroadcastUpdateStatus('Status updated successfully!');
      setTimeout(() => setBroadcastUpdateStatus(''), 3000);
    } catch (error) {
      console.error('Error updating broadcast status:', error);
      setError('Failed to update broadcast status. Please try again.');
      setBroadcastUpdateStatus('');
    } finally {
      setBroadcastLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {error && (
        <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Clean Broadcast Control Center */}
      <Card className="bg-gradient-to-br from-green-50 via-white to-gray-50 border-2 border-green-100">
        <div className="text-center space-y-6 py-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Broadcast Control Center
          </h2>
          
          {/* Clean Toggle Switch */}
          <CleanToggleSwitch
            checked={stats.isOnAir}
            onChange={handleBroadcastStatusChange}
            disabled={broadcastLoading}
          />
          
          {/* Status Message */}
          {broadcastUpdateStatus && (
            <div className="text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg inline-block">
              ✓ {broadcastUpdateStatus}
            </div>
          )}
          
          {/* Loading Overlay */}
          {broadcastLoading && (
            <div className="text-blue-600 font-medium flex items-center justify-center">
              <Spinner size="sm" className="mr-2" />
              Updating status...
            </div>
          )}
        </div>
      </Card>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {stats.totalSchedules}
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Total Schedules
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lab booking entries
            </p>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.totalSignageContent}
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Signage Content
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active display items
            </p>
          </div>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              stats.isOnAir ? 'text-red-600 animate-pulse' : 'text-gray-600'
            }`}>
              {stats.isOnAir ? 'LIVE' : 'IDLE'}
            </div>
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Studio Status
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current broadcast state
            </p>
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            color="green" 
            className="w-full"
            onClick={() => window.location.href = '/schedule'}
          >
            View Schedules
          </Button>
          <Button 
            color="green" 
            className="w-full"
            onClick={() => window.location.href = '/signage-content'}
          >
            Manage Content
          </Button>
          <Button 
            color="green" 
            className="w-full"
            onClick={() => apiMethods.triggerSync()}
          >
            Sync Data
          </Button>
          <Button 
            color="green" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </Card>

    </div>
  );
}