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
  }
}, {
  sequelize,
  modelName: 'Notification',
  indexes: [
    { fields: ['userId'] }
  ]
})

module.exports = Notification