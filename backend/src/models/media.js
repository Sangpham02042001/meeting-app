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
    },
    name: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING(10),
    }
}, {
    sequelize,
    modelName: 'Media'
})

Media.belongsTo(Message, {
    foreignKey: 'messageId',
    onDelete: 'cascade',
})

Message.hasMany(Media, {
    foreignKey: 'messageId'
})

module.exports = Media;