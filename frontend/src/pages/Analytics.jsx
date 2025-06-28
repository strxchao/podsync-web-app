import { Card, Alert, Spinner, Button, Badge, Select } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { apiMethods } from '../api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Chart Colors
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6', 
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.purple, COLORS.pink];

// Usage Chart Component
const UsageChart = ({ data, timeRange, chartType }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">Chart</div>
          <div>No data available for this period</div>
        </div>
      </div>
    );
  }

  const formatXAxisLabel = (value) => {
    if (chartType === 'monthly') {
      const [year, month] = value.split('-');
      return `${month}/${year.slice(2)}`;
    }
    if (chartType === 'weekly') {
      return new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    }
    if (chartType === 'daily') {
      return new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    }
    return value;
  };

  const getDataKey = () => {
    switch (chartType) {
      case 'daily':
        return 'date';
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
      default:
        return 'date';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey={getDataKey()}
          tickFormatter={formatXAxisLabel}
          className="text-sm"
        />
        <YAxis className="text-sm" />
        <Tooltip 
          labelFormatter={(value) => formatXAxisLabel(value)}
          formatter={(value, name) => [
            value,
            name === 'sessions' ? 'Sessions' : 
            name === 'hours' ? 'Hours' : 
            name === 'users' ? 'Unique Users' : name
          ]}
          contentStyle={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="sessions" 
          stroke={COLORS.primary}
          fillOpacity={1}
          fill="url(#sessionsGradient)"
          name="Sessions"
        />
        <Area 
          type="monotone" 
          dataKey="hours" 
          stroke={COLORS.secondary}
          fillOpacity={1}
          fill="url(#hoursGradient)"
          name="Hours"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Facility Usage Chart Component
const FacilityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">🏢</div>
          <div>No facility data available</div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="sessions"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, 'Sessions']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Unit Usage Chart Component
const UnitChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">🎓</div>
          <div>No unit/prodi data available</div>
        </div>
      </div>
    );
  }

  // Limit to top 10 units for better display
  const topUnits = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={topUnits} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          className="text-xs"
        />
        <YAxis className="text-sm" />
        <Tooltip 
          formatter={(value, name) => [
            value,
            name === 'sessions' ? 'Sessions' : 
            name === 'hours' ? 'Hours' : 
            name === 'users' ? 'Users' : name
          ]}
          contentStyle={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="sessions" fill={COLORS.primary} name="Sessions" />
        <Bar dataKey="hours" fill={COLORS.secondary} name="Hours" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Peak Hours Chart Component  
const PeakHoursChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">🕐</div>
          <div>No peak hours data available</div>
        </div>
      </div>
    );
  }

  // Fill missing hours with 0 sessions
  const fullHoursData = [];
  for (let hour = 0; hour < 24; hour++) {
    const existing = data.find(d => d.hour === hour);
    fullHoursData.push({
      hour,
      sessions: existing ? existing.sessions : 0,
      timeLabel: `${hour.toString().padStart(2, '0')}:00`
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={fullHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="timeLabel"
          className="text-xs"
        />
        <YAxis className="text-sm" />
        <Tooltip 
          labelFormatter={(value) => `Time: ${value}`}
          formatter={(value) => [value, 'Sessions']}
          contentStyle={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="sessions" fill={COLORS.accent} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const [analyticsData, systemData, chartsData] = await Promise.all([
        apiMethods.getAnalytics(timeRange),
        apiMethods.getSystemMetrics(),
        fetchChartData(timeRange)
      ]);
      
      setAnalytics(analyticsData);
      setSystemMetrics(systemData);
      setChartData(chartsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please check if the server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchChartData = async (range) => {
    try {
      setChartsLoading(true);
      const response = await apiMethods.getChartData(range);
      return response;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return {
        daily: [],
        weekly: [],
        monthly: [],
        facilities: [],
        units: [],
        peakHours: []
      };
    } finally {
      setChartsLoading(false);
    }
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="12m">Last 12 Months</option>
          </Select>
          <Button
            color="gray"
            onClick={fetchAnalytics}
            disabled={refreshing}
          >
            {refreshing ? <Spinner size="sm" className="mr-2" /> : ''}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Content Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.content.total}
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-1">
                Total Content
              </h5>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <span>{analytics.content.active} Active</span>
                <span>{analytics.content.withMedia} Media</span>
              </div>
              <div className="mt-2">
                <Badge className="bg-green-100 text-green-700">
                  {analytics.content.recentlyCreated} created recently
                </Badge>
              </div>
            </div>
          </Card>

          {/* Today's Schedule Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.schedule.todaySchedules || 0}
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-1">
                Today's Podcasts
              </h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div>Total: {analytics.schedule.total} schedules</div>
              </div>
              <div className="mt-2">
                <Badge color="success">
                  {analytics.schedule.completionRate}% completion rate
                </Badge>
              </div>
            </div>
          </Card>

          {/* Broadcast Status - Live/Idle */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                analytics.broadcast.currentlyOnAir ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.broadcast.currentlyOnAir ? 'LIVE' : 'IDLE'}
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-1">
                Broadcast Status
              </h5>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>{analytics.broadcast.totalOnTimeHours}h total airtime</div>
                <div>{analytics.broadcast.averageSessionHours}h avg duration</div>
                {analytics.broadcast.totalSessions > 0 && (
                  <div>{analytics.broadcast.totalSessions} total sessions</div>
                )}
              </div>
              
              <div className="mt-2">
                <Badge color={analytics.broadcast.currentlyOnAir ? "failure" : "gray"}>
                  {analytics.broadcast.currentlyOnAir ? "ON AIR" : "OFF AIR"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Lab Bookings Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {analytics.entries.total}
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-1">
                Lab Bookings
              </h5>
              <div className="text-sm text-gray-600">
                <div>{analytics.entries.thisWeek} this period</div>
                <div>{analytics.entries.weeklyGrowth > 0 ? '+' : ''}{analytics.entries.weeklyGrowth}% growth</div>
              </div>
              <div className="mt-2">
                <Badge color={
                  analytics.entries.trend === 'increasing' ? 'success' :
                  analytics.entries.trend === 'decreasing' ? 'failure' : 'warning'
                }>
                  {analytics.entries.trend === 'increasing' ? 'Growing' :
                   analytics.entries.trend === 'decreasing' ? 'Declining' : '➡️ Stable'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* CHARTS SECTION - NEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Podcast Usage Trends</h3>
            {chartsLoading && <Spinner size="sm" />}
          </div>
          {chartData && (
            <UsageChart 
              data={timeRange === '12m' ? chartData.monthly : timeRange === '30d' ? chartData.daily : chartData.daily} 
              timeRange={timeRange}
              chartType={timeRange === '12m' ? 'monthly' : 'daily'}
            />
          )}
        </Card>

        {/* Facility Usage Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Facility Usage</h3>
          {chartData && <FacilityChart data={chartData.facilities} />}
        </Card>

        {/* Peak Hours Chart */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Peak Usage Hours</h3>
          {chartData && <PeakHoursChart data={chartData.peakHours} />}
        </Card>

        {/* Unit/Prodi Usage */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Usage by Unit/Prodi</h3>
          {chartData && <UnitChart data={chartData.units} />}
        </Card>
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">System Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{systemMetrics.system.uptimeFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-medium">
                  {systemMetrics.system.memory.used}MB / {systemMetrics.system.memory.total}MB 
                  ({systemMetrics.system.memory.percentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Node.js Version:</span>
                <span className="font-medium">{systemMetrics.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{systemMetrics.system.platform}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Database Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge color={systemMetrics.database.status === 'healthy' ? 'success' : 'failure'}>
                  {systemMetrics.database.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">{systemMetrics.database.responseTime}ms</span>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Table Sizes:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Content: {systemMetrics.database.tables.signageContent}</div>
                  <div>Schedules: {systemMetrics.database.tables.schedules}</div>
                  <div>Broadcasts: {systemMetrics.database.tables.broadcastStatuses}</div>
                  <div>Entries: {systemMetrics.database.tables.googleSheetEntries}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {analytics && analytics.recentActivity && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => {
              const formatTimestamp = (timestamp) => {
                try {
                  if (!timestamp) return 'Unknown time';
                  
                  const date = new Date(timestamp);
                  if (isNaN(date.getTime())) return 'Invalid date';
                  
                  return date.toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    day: '2-digit',
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZoneName: 'short'
                  });
                } catch (error) {
                  console.warn('Error formatting timestamp:', error);
                  return 'Invalid date';
                }
              };

              return (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {activity.type === 'content' && '📄'}
                      {activity.type === 'schedule' && '📅'}
                      {activity.type === 'broadcast' && '📡'}
                    </div>
                    <div>
                      <div className="font-medium">{activity.details}</div>
                      <div className="text-sm text-gray-600">
                        {activity.updatedBy && `by ${activity.updatedBy}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}