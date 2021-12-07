const { DataTypes, Model } = require('sequelize')
const sequelize = require('./index')

class Message extends Model {
}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(10),
  }
}, {
  sequelize,
  modelName: 'Message'
})

module.exports = Message