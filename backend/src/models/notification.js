const { DataTypes, Model } = require('sequelize')
const sequelize = require('./index')

class Notification extends Model {
}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relativeLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Notification',
  indexes: [
    { fields: ['userId'] },
    { fields: ['teamId'] },
    { fields: ['conversationId'] }
  ]
})

module.exports = Notification