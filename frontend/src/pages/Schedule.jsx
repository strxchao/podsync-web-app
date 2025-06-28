import { Table, Spinner, Button, Alert, TextInput, Select } from 'flowbite-react';
import { useState, useEffect, useRef } from 'react';
import { apiMethods } from '../api.js';

export function Schedule() {
  const [entries, setEntries] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  
  // Available units for filter dropdown
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  // Ref for debouncing
  const searchTimeoutRef = useRef(null);

  // SMART UNITS MAPPING: Main unit -> all variations
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

  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  // ENHANCED: Smart units loading with grouping
  const fetchAvailableUnits = async () => {
    try {
      setUnitsLoading(true);
      console.log('🎓 Loading smart units mapping...');
      
      // Get main unit names (display names)
      const mainUnits = Object.keys(unitsMapping);
      
      // Add "Others" option at the end
      const unitsWithOthers = [...mainUnits, 'Others'];
      
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAvailableUnits(unitsWithOthers);
      console.log(`Loaded ${unitsWithOthers.length} smart units (including Others)`);
      
    } catch (error) {
      console.error('Error loading units:', error);
      setAvailableUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await apiMethods.getSyncStatus();
      setSyncStatus(response.data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      setError('Failed to load sync status');
    }
  };

  // ENHANCED: Use enhanced getSyncEntries with smart unit parameter
  const fetchEntries = async (page = currentPage, limit = itemsPerPage, search = activeSearchTerm, date = dateFilter, unit = unitFilter) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: page.toString(),
        limit: limit.toString()
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      if (date) {
        params.startDate = date;
        params.endDate = date;
      }
      
      // CRITICAL: Add smart unit filtering
      if (unit) {
        params.smartUnit = unit; // Use our custom parameter for smart filtering
      }
      
      console.log('Fetch entries with smart filtering:', {
        page,
        limit,
        search,
        date,
        smartUnit: unit,
        params
      });
      
      // FIXED: Use enhanced getSyncEntries method
      const response = await apiMethods.getSyncEntries(params);
      console.log('Enhanced sync entries response:', response.data);
      
      // Handle different response structures
      let entriesData = [];
      let pagination = {
        total: 0,
        pages: 1,
        currentPage: 1
      };
      
      if (response.data && Array.isArray(response.data)) {
        entriesData = response.data;
        pagination = {
          total: response.data.length,
          pages: 1,
          currentPage: 1
        };
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        entriesData = response.data.data;
        pagination = {
          total: response.data.total || 0,
          pages: response.data.pages || 1,
          currentPage: response.data.currentPage || 1
        };
        
        // Log smart filtering results if available
        if (response.data.filtered) {
          console.log('Smart filtering applied:', {
            filterType: response.data.filterType,
            filterValue: response.data.filterValue,
            originalTotal: response.data.originalTotal,
            filteredTotal: response.data.total,
            showing: entriesData.length
          });
        }
      } else if (response.data && response.data.rows && Array.isArray(response.data.rows)) {
        entriesData = response.data.rows;
        pagination = {
          total: response.data.count || 0,
          pages: Math.ceil((response.data.count || 0) / limit),
          currentPage: page
        };
      } else {
        console.warn('Unexpected response structure:', response.data);
        entriesData = [];
        pagination = { total: 0, pages: 1, currentPage: 1 };
      }
      
      setEntries(entriesData);
      setTotalPages(pagination.pages);
      setTotalItems(pagination.total);
      setCurrentPage(pagination.currentPage);
      
      // Log successful filtering
      if (unit) {
        console.log(`Smart filter "${unit}" applied: ${entriesData.length} entries found`);
      }
      
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Failed to load entries. Please try again later.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Only trigger on initial load
  useEffect(() => {
    fetchSyncStatus();
    fetchAvailableUnits();
    fetchEntries();
  }, []);

  // Only trigger on filter changes
  useEffect(() => {
    if (!loading) {
      fetchEntries(1, itemsPerPage, activeSearchTerm, dateFilter, unitFilter);
      setCurrentPage(1);
    }
  }, [activeSearchTerm, dateFilter, unitFilter, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchEntries(newPage, itemsPerPage, activeSearchTerm, dateFilter, unitFilter);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncLoading(true);
      await apiMethods.triggerSync();
      await fetchSyncStatus();
      await fetchEntries(1, itemsPerPage, activeSearchTerm, dateFilter, unitFilter);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error triggering sync:', error);
      setError('Failed to trigger sync. Please try again.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setDateFilter('');
    setUnitFilter('');
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // ENHANCED: Get display info for selected unit
  const getUnitDisplayInfo = () => {
    if (!unitFilter) return null;
    
    if (unitFilter === 'Others') {
      return {
        main: 'Others',
        variations: ['All unregistered units'],
        description: 'Units not in the registered list'
      };
    }
    
    const variations = unitsMapping[unitFilter] || [unitFilter];
    return {
      main: unitFilter,
      variations: variations,
      description: `Includes ${variations.length} variations`
    };
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
        <span className="ml-2">Loading schedule data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lab Booking Schedule</h1>
        <div className="flex items-center gap-4">
          {syncStatus && syncStatus.lastSyncedAt && (
            <div className="text-sm text-gray-600">
              Last synced: {new Date(syncStatus.lastSyncedAt).toLocaleString()}
            </div>
          )}
          <Button
            className='enabled:hover:bg-green-700 dark:bg-green-600 dark:focus:ring-green-800 dark:enabled:hover:bg-green-700 rounded-lg bg-green-500 text-white transition-all duration-200'
            onClick={handleManualSync}
            disabled={syncLoading}
          >
            {syncLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ENHANCED: Smart Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <TextInput
              placeholder="Type and press Enter to search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              className="transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <TextInput
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit/Prodi (Smart Filter)
            </label>
            <Select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              disabled={unitsLoading}
            >
              <option value="">
                {unitsLoading ? 'Loading units...' : 'All Units'}
              </option>
              {availableUnits.map((unit, index) => (
                <option key={index} value={unit}>
                  {unit} {unit === 'Others' ? '(Unregistered)' : ''}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per Page
            </label>
            <Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Select>
          </div>
        </div>
        
        {/* Button row with smart unit info */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSearch} 
              color="green"
              disabled={loading}
              size="sm"
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Search
            </Button>
            <Button onClick={clearFilters} color="gray" size="sm">
              Clear
            </Button>
          </div>
          
          {/* ENHANCED: Results Info with smart unit details */}
          <div className="text-sm text-gray-600 text-left sm:text-right">
            <div>Showing {entries.length} of {totalItems} entries</div>
            
            {activeSearchTerm && (
              <div className="text-xs text-green-600">
                Search: "{activeSearchTerm}"
              </div>
            )}
            
            {dateFilter && (
              <div className="text-xs text-blue-600">
                📅 Date: {new Date(dateFilter).toLocaleDateString('id-ID')}
              </div>
            )}
            
            {unitFilter && (() => {
              const unitInfo = getUnitDisplayInfo();
              return (
                <div className="text-xs text-purple-600">
                  🎓 {unitInfo.main}
                  {unitFilter !== 'Others' && (
                    <div className="text-xs text-gray-500">
                      Includes: {unitsMapping[unitFilter]?.slice(0, 3).join(', ')}
                      {unitsMapping[unitFilter]?.length > 3 && ` +${unitsMapping[unitFilter].length - 3} more`}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {searchTerm !== activeSearchTerm && searchTerm && (
              <div className="text-xs text-orange-600">
                ⏎ Press Enter to search for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <Spinner size="lg" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <Table striped hoverable>
            <Table.Head>
              <Table.HeadCell>Timestamp</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>ID/NIP</Table.HeadCell>
              <Table.HeadCell>Unit/Prodi</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Purpose</Table.HeadCell>
              <Table.HeadCell>Facility</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Time</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {entries && entries.length > 0 ? (
                entries.map((entry, index) => (
                  <Table.Row key={entry.id || index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="text-sm">
                      {formatTimestamp(entry.timestamp)}
                    </Table.Cell>
                    <Table.Cell className="font-medium">
                      {entry.nama_lengkap || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.nip_kode_dosen_nim || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-blue-600">
                        {entry.unit_prodi || 'N/A'}
                      </span>
                      {/* Show if this entry matches the current filter */}
                      {unitFilter && unitFilter !== 'Others' && unitsMapping[unitFilter] && (
                        <div className="text-xs text-green-500">
                          {unitsMapping[unitFilter].some(variation => 
                            (entry.unit_prodi || '').toLowerCase().includes(variation.toLowerCase())
                          ) ? '✓ Matched' : ''}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.no_telepon_mobile || 'N/A'}
                    </Table.Cell>
                    <Table.Cell className="max-w-xs truncate">
                      {entry.keperluan_peminjaman || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.jenis_fasilitas_dipinjam || 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.tanggal_mulai_peminjaman 
                        ? new Date(entry.tanggal_mulai_peminjaman).toLocaleDateString('id-ID')
                        : 'N/A'
                      }
                      {entry.tanggal_selesai_peminjaman && 
                       entry.tanggal_mulai_peminjaman !== entry.tanggal_selesai_peminjaman && (
                        <div className="text-xs text-gray-500">
                          to {new Date(entry.tanggal_selesai_peminjaman).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.jam_mulai && entry.jam_berakhir 
                        ? `${entry.jam_mulai} - ${entry.jam_berakhir}`
                        : 'N/A'
                      }
                      {entry.jumlah_jam && (
                        <div className="text-xs text-gray-500">
                          ({entry.jumlah_jam} hours)
                        </div>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={9} className="text-center text-gray-500 py-8">
                    {error ? 'Error loading entries' : 
                     activeSearchTerm || dateFilter || unitFilter ? 'No entries found matching your search criteria.' :
                     'No entries found. Click "Sync Now" to fetch data from Google Sheets.'}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} ({totalItems} total entries)
          </div>
          
          <nav className="flex items-center space-x-1">
            <Button
              color="gray"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  ) : (
                    <Button
                      color={currentPage === page ? "green" : "gray"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? "font-bold" : ""}
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              color="gray"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Go to:</span>
            <TextInput
              type="number"
              min="1"
              max={totalPages}
              className="w-20"
              placeholder="Page"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}