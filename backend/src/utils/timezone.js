// Centralized timezone utilities for consistent time handling

// Target timezone: Asia/Jakarta (WIB) - UTC+7
export const TARGET_TIMEZONE = 'Asia/Jakarta';
export const TARGET_TIMEZONE_OFFSET = '+07:00';

// Format date as MySQL DATETIME string (YYYY-MM-DD HH:mm:ss)
export function formatForMySQL(date) {
  if (!date) return null;
  
  // Ensure we have a Date object
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  // Format in local time (assuming server is set to WIB)
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Parse Google Sheets timestamp format (DD/MM/YYYY HH:mm:ss) to Date object
export function parseGoogleSheetsTimestamp(timestampStr) {
  if (!timestampStr || typeof timestampStr !== 'string') return null;
  
  try {
    // Expected format: "DD/MM/YYYY HH:mm:ss"
    const [datePart, timePart] = timestampStr.split(' ');
    if (!datePart || !timePart) return null;
    
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');
    
    // Create date in local timezone (assumes server is in WIB)
    const localDate = new Date(
      parseInt(year), 
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds || 0)
    );
    
    return localDate;
  } catch (error) {
    console.error('Error parsing Google Sheets timestamp:', timestampStr, error);
    return null;
  }
}

// Convert any date to WIB timezone
export function convertToWIB(date) {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  // Return the date formatted in WIB timezone
  return new Date(d.toLocaleString('en-US', { timeZone: TARGET_TIMEZONE }));
}

// Get current time in WIB
export function getCurrentWIBTime() {
  return convertToWIB(new Date());
}

// Format date for display in WIB timezone
export function formatWIBDisplay(date) {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return d.toLocaleString('id-ID', { 
    timeZone: TARGET_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Check if date is today in WIB timezone
export function isToday(date) {
  if (!date) return false;
  
  const d = new Date(date);
  const today = getCurrentWIBTime();
  
  return d.toDateString() === today.toDateString();
}

// Get start and end of day in WIB timezone
export function getWIBDayBounds(date = new Date()) {
  const wibDate = convertToWIB(date);
  
  const startOfDay = new Date(wibDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(wibDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

// Validate timezone consistency
export function validateTimezone() {
  const now = new Date();
  const wibOffset = now.getTimezoneOffset();
  
  return {
    isWIB: wibOffset === -420, // WIB is UTC+7, so offset is -420 minutes
    currentOffset: wibOffset,
    expectedOffset: -420,
    recommendation: wibOffset !== -420 ? 'Set system timezone to Asia/Jakarta (WIB)' : 'Timezone is correct'
  };
}

export default {
  TARGET_TIMEZONE,
  TARGET_TIMEZONE_OFFSET,
  formatForMySQL,
  parseGoogleSheetsTimestamp,
  convertToWIB,
  getCurrentWIBTime,
  formatWIBDisplay,
  isToday,
  getWIBDayBounds,
  validateTimezone
};