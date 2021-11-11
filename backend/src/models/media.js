const { DataTypes, Model } = require('sequelize')
const Message = require('./message')
const sequelize = require('./index')

class Media extends Model {
}

Media.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pathName: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    modelName: 'Media'
})

Media.belongsTo(Message, {
    foreignKey: 'messageId'
})

Message.hasMany(Media, {
    foreignKey: 'messageId',
})

module.exports = Media;