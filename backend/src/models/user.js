const { DataTypes, Model } = require('sequelize')
const sequelize = require('./index')
const Conversation = require('./conversation');
const Group = require('./group');
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

User.belongsToMany(Group, {
  through: 'Users_Groups',
  foreignKey: 'userId'
})
Group.belongsToMany(User, {
  through: 'Users_Groups',
  foreignKey: 'groupId'
})

User.belongsToMany(Group, {
  through: 'Request_Users_Groups',
  foreignKey: 'userId'
})
Group.belongsToMany(User, {
  through: 'Request_Users_Groups',
  foreignKey: 'groupId'
})

Meeting.belongsTo(User, {
  as: 'host',
  foreignKey: 'hostId'
})
Group.belongsTo(User, {
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