// src/scripts/diagnostics.js
import { testConnection } from './testConnection.js';
import { checkSignageContentTable } from './checkTableStructure.js';
import { testInsertWithMediaUrl } from './testInsert.js';

async function runDiagnostics() {
  console.log(' Running complete system diagnostics...\n');
  
  // 1. Test connections
  await testConnection();
  
  // 2. Check table structure
  await checkSignageContentTable();
  
  // 3. Test database operations
  await testInsertWithMediaUrl();
  
  console.log('\n All diagnostics completed!');
}