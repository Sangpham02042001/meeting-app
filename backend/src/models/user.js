const { DataTypes, Model, Sequelize } = require('sequelize')
const sequelize = require('./index')
const Conversation = require('./conversation');
const Team = require('./team');
const Meeting = require('./meeting');
const Message = require('./message')

class User extends Model {
  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING, //mean VARCHAR(255)
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hash_password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  avatar: {
    type: DataTypes.BLOB
  }
}, {
  sequelize,
  modelName: 'User'
})

User.belongsToMany(Conversation, {
  through: 'Users_Conversations',
  foreignKey: 'userId',
})
Conversation.belongsToMany(User, {
  through: 'Users_Conversations',
  foreignKey: 'conversationId',
})

User.belongsToMany(Team, {
  through: 'Users_Teams',
  as: 'teams',
  foreignKey: 'userId'
})
Team.belongsToMany(User, {
  through: 'Users_Teams',
  as: 'members',
  foreignKey: 'teamId'
})

User.belongsToMany(Team, {
  through: 'Request_Users_Teams',
  as: 'requestingTeams',
  foreignKey: 'requestUserId'
})
Team.belongsToMany(User, {
  through: 'Request_Users_Teams',
  as: 'requestUsers',
  foreignKey: 'teamId'
})

User.belongsToMany(Team, {
  through: 'Invited_Users_Teams',
  as: 'invitedTeams',
  foreignKey: 'invitedUserId'
})
Team.belongsToMany(User, {
  through: 'Invited_Users_Teams',
  as: 'invitedUsers',
  foreignKey: 'teamId'
})

Meeting.belongsTo(User, {
  as: 'host',
  foreignKey: 'hostId'
})
Team.belongsTo(User, {
  as: 'host',
  foreignKey: 'hostId'
})

Meeting.belongsToMany(User, {
  through: 'Users_Meetings',
  foreignKey: 'meetingId'
})
User.belongsToMany(Meeting, {
  through: 'Users_Meetings',
  foreignKey: 'userId'
})

User.hasMany(Message, {
  as: 'messages',
  foreignKey: 'userId'
})

module.exports = User