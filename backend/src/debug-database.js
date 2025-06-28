// backend/debug-database.js - CHECK DATABASE CONTENT
import { sequelize } from './src/config/database.js';
import SignageContent from './src/models/SignageContent.js';

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database content...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check table structure
    console.log('\n📋 Table structure:');
    const [structure] = await sequelize.query('DESCRIBE signage_content');
    structure.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check raw data
    console.log('\n📊 Raw database data:');
    const [rawData] = await sequelize.query('SELECT * FROM signage_content ORDER BY id');
    rawData.forEach(row => {
      console.log(`   ID ${row.id}: ${row.title}`);
      console.log(`     media_url: ${row.media_url || 'NULL'}`);
      console.log(`     qr_code_url: ${row.qr_code_url || 'NULL'}`);
      console.log(`     type: ${row.type}`);
      console.log(`     is_active: ${row.is_active}`);
      console.log('');
    });

    // Check using Sequelize model
    console.log('\n🔍 Data via Sequelize model:');
    const modelData = await SignageContent.findAll({
      order: [['id', 'ASC']]
    });
    
    modelData.forEach(content => {
      console.log(`   ID ${content.id}: ${content.title}`);
      console.log(`     mediaUrl: ${content.mediaUrl || 'NULL'}`);
      console.log(`     qrCodeUrl: ${content.qrCodeUrl || 'NULL'}`);
      console.log(`     type: ${content.type}`);
      console.log(`     isActive: ${content.isActive}`);
      console.log('');
    });

    // Check specific content
    const botramContent = await SignageContent.findOne({
      where: { title: 'Botram' }
    });
    
    if (botramContent) {
      console.log('\n🎯 Botram content details:');
      console.log('Raw data:', JSON.stringify(botramContent.toJSON(), null, 2));
    } else {
      console.log('\n❌ Botram content not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDatabase();