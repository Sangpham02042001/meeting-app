const { DataTypes, Model } = require('sequelize')
const sequelize = require('./index')
const User = require('./user');

class Feedback extends Model {
}

Feedback.init({
  content: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Feedback'
})

Feedback.belongsTo(User, {
    foreignKey: 'userId',
  })

module.exports = Feedback