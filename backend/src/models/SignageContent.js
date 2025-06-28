import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

const SignageContent = sequelize.define('SignageContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('announcement', 'promotion', 'schedule', 'other'),
    defaultValue: 'announcement'
  },
  // PERBAIKAN: Field mapping yang eksplisit dan konsisten
  media_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'media_url'  // Eksplisit mapping ke kolom database
  },
  qr_code_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'qr_code_url'  // Eksplisit mapping ke kolom database
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  created_by: {
    type: DataTypes.STRING,
    defaultValue: 'system',
    field: 'created_by'
  }
}, {
  tableName: 'signage_content',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['is_active']
    },
    {
      fields: ['display_order']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
SignageContent.prototype.isCurrentlyActive = function() {
  const now = new Date();
  
  if (!this.is_active) return false;
  
  if (this.start_date && now < this.start_date) return false;
  if (this.end_date && now > this.end_date) return false;
  
  return true;
};

SignageContent.prototype.generateQRCode = function() {
  if (this.media_url) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.media_url)}`;
  }
  return null;
};

// Class methods
SignageContent.findActive = function() {
  const now = new Date();
  
  return this.findAll({
    where: {
      is_active: true,
      [Op.and]: [
        {
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: now } }
          ]
        }
      ]
    },
    order: [
      ['display_order', 'ASC'],
      ['created_at', 'DESC']
    ]
  });
};

export default SignageContent;