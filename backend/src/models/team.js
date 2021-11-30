const { DataTypes, Model } = require('sequelize')
const Meeting = require('./meeting')
const sequelize = require('./index')
const Message = require('./message')
const { v4 } = require('uuid')

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
  },
  teamCode: {
    type: DataTypes.STRING,
    defaultValue: `${v4().toString().slice(0, 8)}`,
  }
}, {
  sequelize,
  modelName: 'Team',
  indexes: [
    { fields: ['name'] },
  ]
})

Team.hasMany(Meeting, {
  as: 'meetings', //alias
  foreignKey: 'teamId'
})

Meeting.belongsTo(Team, {
  as: 'team',
  foreignKey: 'teamId'
})

Team.hasMany(Message, {
  as: 'messages',
  foreignKey: 'teamId'
})

module.exports = Team