import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const BroadcastStatus = sequelize.define('BroadcastStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  isOnAir: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  statusMessage: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Off Air'
  },
  updatedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'system'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // Add foreign key field - this will be set up as association in index.js
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'schedules',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'broadcast_statuses',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: (instance) => {
      instance.lastUpdated = new Date();
      if (instance.isOnAir && !instance.statusMessage) {
        instance.statusMessage = 'On Air';
      } else if (!instance.isOnAir && !instance.statusMessage) {
        instance.statusMessage = 'Off Air';
      }
    }
  }
});

// Class methods
BroadcastStatus.getCurrentStatus = async function() {
  return await this.findOne({
    order: [['lastUpdated', 'DESC']],
    include: [{
      association: 'schedule',
      required: false
    }]
  });
};

BroadcastStatus.updateStatus = async function(isOnAir, statusMessage, updatedBy, scheduleId = null) {
  const currentStatus = await this.getCurrentStatus();
  
  if (currentStatus) {
    return await currentStatus.update({
      isOnAir,
      statusMessage: statusMessage || (isOnAir ? 'On Air' : 'Off Air'),
      updatedBy: updatedBy || 'system',
      schedule_id: scheduleId
    });
  } else {
    return await this.create({
      isOnAir,
      statusMessage: statusMessage || (isOnAir ? 'On Air' : 'Off Air'),
      updatedBy: updatedBy || 'system',
      schedule_id: scheduleId
    });
  }
};

export default BroadcastStatus;