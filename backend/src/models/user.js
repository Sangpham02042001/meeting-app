const { DataTypes, Model } = require('sequelize')
const sequelize = require('./index')

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

module.exports = User