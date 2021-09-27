const { DataTypes, Model } = require('sequelize')
const Meeting = require('./meeting')
const sequelize = require('./index')
const Message = require('./message')

class Team extends Model {
}

Team.init({
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
    type: DataTypes.STRING
  },
  teamType: {
    type: DataTypes.STRING,
    defaultValue: 'public',
  }
}, {
  sequelize,
  modelName: 'Team'
})

Team.hasMany(Meeting, {
  as: 'meetings', //alias
  foreignKey: 'teamId'
})

Team.hasMany(Message, {
  as: 'messages',
  foreignKey: 'teamId'
})

module.exports = Team