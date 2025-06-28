import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'ongoing', 'completed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  organizer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Add foreign key field for GoogleSheetEntry
  google_sheet_entry_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'google_sheet_entries',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['date', 'start_time']
    },
    {
      fields: ['google_sheet_entry_id']
    }
  ],
  validate: {
    endTimeAfterStartTime() {
      if (this.start_time && this.end_time && this.end_time <= this.start_time) {
        throw new Error('End time must be after start time');
      }
    }
  }
});

// Instance methods
Schedule.prototype.isActive = function() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];
  
  return this.date === today && 
         this.start_time <= currentTime && 
         currentTime <= this.end_time;
};

Schedule.prototype.isPast = function() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];
  
  return this.date < today || 
         (this.date === today && this.end_time < currentTime);
};

// FIXED: Class methods with proper Op usage
Schedule.findActive = function() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0];
  
  try {
    return this.findAll({
      where: {
        date: today,
        start_time: { [Op.lte]: currentTime }, // FIXED: Now Op is properly imported
        end_time: { [Op.gte]: currentTime }    // FIXED: Now Op is properly imported
      },
      order: [['start_time', 'ASC']]
    });
  } catch (error) {
    console.error('❌ Error in Schedule.findActive:', error);
    // Return empty array as fallback
    return Promise.resolve([]);
  }
};

Schedule.findToday = function() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    return this.findAll({
      where: { date: today },
      order: [['start_time', 'ASC']]
    });
  } catch (error) {
    console.error('❌ Error in Schedule.findToday:', error);
    return Promise.resolve([]);
  }
};

// Method to create schedule from GoogleSheetEntry
Schedule.createFromGoogleSheetEntry = async function(entry) {
  try {
    return await this.create({
      title: entry.keperluan_peminjaman || 'Lab Booking',
      description: `${entry.jenis_fasilitas_dipinjam} - ${entry.nama_lengkap}`,
      date: entry.tanggal_mulai_peminjaman,
      start_time: entry.jam_mulai,
      end_time: entry.jam_berakhir,
      status: 'pending',
      location: entry.jenis_fasilitas_dipinjam,
      organizer: entry.nama_lengkap,
      google_sheet_entry_id: entry.id,
      last_synced_at: new Date()
    });
  } catch (error) {
    console.error('❌ Error creating schedule from Google Sheet entry:', error);
    throw error;
  }
};

export default Schedule;