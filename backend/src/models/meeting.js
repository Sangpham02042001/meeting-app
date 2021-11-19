const { DataTypes, Model } = require('sequelize')
const Message = require('./message')
const sequelize = require('./index')

class Meeting extends Model {
}

Meeting.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Meeting'
})

Meeting.hasMany(Message, {
  as: 'messages',
  foreignKey: 'meetingId'
})


module.exports = Meeting