import { sequelize } from '../../config/database.js';
import { testConnection } from '../../config/database.js';

async function checkSignageContentTable() {
  try {
    console.log('🔍 Checking signage_content table structure...');
    
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database.');
      process.exit(1);
    }

    // Get table structure
    const [results] = await sequelize.query(`
      DESCRIBE signage_content
    `);

    console.log('Current signage_content table structure:');
    console.log('=' .repeat(80));
    results.forEach(column => {
      const nullable = column.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = column.Default ? `DEFAULT: ${column.Default}` : '';
      console.log(`${column.Field.padEnd(20)} | ${column.Type.padEnd(15)} | ${nullable.padEnd(8)} | ${defaultVal}`);
    });

    // Check if media_url and qr_code_url exist
    const hasMediaUrl = results.some(col => col.Field === 'media_url');
    const hasQrCodeUrl = results.some(col => col.Field === 'qr_code_url');

    console.log('\n🔍 Field Verification:');
    console.log(`media_url column: ${hasMediaUrl ? 'EXISTS' : 'MISSING'}`);
    console.log(`qr_code_url column: ${hasQrCodeUrl ? 'EXISTS' : '❌ MISSING'}`);

    if (!hasMediaUrl || !hasQrCodeUrl) {
      console.log('\n⚠️  MISSING COLUMNS DETECTED!');
      console.log('Please run the migration script to add missing columns:');
      if (!hasMediaUrl) console.log('- node src/scripts/addMediaUrlField.js');
      if (!hasQrCodeUrl) console.log('- node src/scripts/addQrCodeField.js');
    } else {
      console.log('\n All required columns exist!');
    }

    // Test INSERT with media_url and qr_code_url
    console.log('\n Testing INSERT with media_url and qr_code_url...');
    try {
      const testData = {
        title: 'TEST_CONTENT_' + Date.now(),
        description: 'Test content for verification',
        type: 'announcement',
        media_url: 'https://example.com/test',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test',
        display_order: 999,
        is_active: true,
        created_by: 'test_script'
      };

      const [insertResult] = await sequelize.query(`
        INSERT INTO signage_content 
        (title, description, type, media_url, qr_code_url, display_order, is_active, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          testData.title,
          testData.description, 
          testData.type,
          testData.media_url,
          testData.qr_code_url,
          testData.display_order,
          testData.is_active,
          testData.created_by
        ]
      });

      console.log(' INSERT test successful! Inserted ID:', insertResult.insertId);

      // Clean up test data
      await sequelize.query('DELETE FROM signage_content WHERE created_by = "test_script"');
      console.log('🗑️  Test data cleaned up');

    } catch (insertError) {
      console.error(' INSERT test failed:', insertError.message);
    }

    process.exit(0);
  } catch (error) {
    console.error(' Error checking table structure:', error.message);
    process.exit(1);
  }
}

// Run the check if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkSignageContentTable().catch(error => {
    console.error('Check failed:', error);
    process.exit(1);
  });
}

export { checkSignageContentTable };