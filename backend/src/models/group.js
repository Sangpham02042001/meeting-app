const { DataTypes, Model } = require('sequelize')
const Meeting = require('./meeting')
const sequelize = require('./index')
const Message = require('./message')

class Group extends Model {
}

Group.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coverPhoto: {
    type: DataTypes.BLOB
  },
  groupType: {
    type: DataTypes.STRING,
    defaultValue: 'public',
  }
}, {
  sequelize,
  modelName: 'Group'
})

Group.hasMany(Meeting, {
  as: 'meetings', //alias
  foreignKey: 'groupId'
})

Group.hasMany(Message, {
  as: 'messages',
  foreignKey: 'groupId'
})

module.exports = Group