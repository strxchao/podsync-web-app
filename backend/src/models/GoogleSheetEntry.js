import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

const GoogleSheetEntry = sequelize.define('GoogleSheetEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nip_kode_dosen_nim: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  no_telepon_mobile: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  unit_prodi: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  keperluan_peminjaman: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  jenis_fasilitas_dipinjam: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tanggal_mulai_peminjaman: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tanggal_selesai_peminjaman: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bulan_peminjaman: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  jam_mulai: {
    type: DataTypes.TIME,
    allowNull: true
  },
  jam_berakhir: {
    type: DataTypes.TIME,
    allowNull: true
  },
  jumlah_jam: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'google_sheet_entries',
  timestamps: true,
  underscored: true,
  paranoid: true, // Adds deletedAt timestamp for soft deletes
  indexes: [
    {
      fields: ['timestamp']
    },
    {
      fields: ['nip_kode_dosen_nim']
    },
    {
      fields: ['tanggal_mulai_peminjaman']
    },
    {
      fields: ['tanggal_selesai_peminjaman']
    },
    {
      unique: true,
      fields: ['timestamp', 'nip_kode_dosen_nim']
    }
  ]
});

// Instance methods
GoogleSheetEntry.prototype.isToday = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.tanggal_mulai_peminjaman === today;
};

GoogleSheetEntry.prototype.isActive = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.tanggal_mulai_peminjaman <= today && 
         this.tanggal_selesai_peminjaman >= today;
};

// Class methods
GoogleSheetEntry.findToday = function() {
  const today = new Date().toISOString().split('T')[0];
  
  return this.findAll({
    where: {
      tanggal_mulai_peminjaman: { [Op.lte]: today },
      tanggal_selesai_peminjaman: { [Op.gte]: today }
    },
    order: [['jam_mulai', 'ASC']]
  });
};

GoogleSheetEntry.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      tanggal_mulai_peminjaman: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [
      ['tanggal_mulai_peminjaman', 'ASC'],
      ['jam_mulai', 'ASC']
    ]
  });
};

export default GoogleSheetEntry;