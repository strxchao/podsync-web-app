// Simple timezone test
console.log('=== Simple Timezone Test ===\n');

// Test timestamp parsing logic
function parseTimestamp(timestampStr) {
  const [datePart, timePart] = timestampStr.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  // Create ISO string with WIB timezone offset (+07:00)
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.000+07:00`;
  
  // Parse with timezone information
  const date = new Date(isoString);
  
  return date;
}

// Test cases from screenshots
const testCases = [
  '22/06/2025 02:30:44', // from screenshot 2
  '21/06/2025 19:52:57', // from screenshot 1
  '06/06/2025 01:47:10'  // from database example
];

console.log('Current system time:');
console.log('- Local:', new Date().toLocaleString());
console.log('- UTC:', new Date().toISOString());
console.log('- WIB:', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
console.log();

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase}`);
  
  try {
    const parsed = parseTimestamp(testCase);
    
    console.log('  ISO (UTC):', parsed.toISOString());
    console.log('  WIB Format:', parsed.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    console.log('  UTC Format:', parsed.toLocaleString('en-US', { timeZone: 'UTC' }));
    
    // Compare with database format (should be UTC)
    const dbFormat = parsed.toISOString().replace('T', ' ').replace('.000Z', '');
    console.log('  DB Format (UTC):', dbFormat);
    console.log();
    
  } catch (error) {
    console.log('  ERROR:', error.message);
    console.log();
  }
});

console.log('=== Test Complete ===');