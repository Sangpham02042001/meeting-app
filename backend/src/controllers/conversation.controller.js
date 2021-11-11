const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');
const Media = require('../models/media');
const sequelize = require('../models');
const { Op, QueryTypes } = require("sequelize");
const fs = require('fs');
const { v4 } = require('uuid');
const { Readable } = require('stream');

const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await sequelize.query(
            "SELECT conversationId, userId as participantId, tb1.isRead " +
            "FROM users_conversations uc " +
            "JOIN (SELECT conversationId, isRead FROM users_conversations WHERE userId = :userId) tb1 using(conversationId) " +
            "WHERE uc.userId NOT LIKE :userId " +
            "ORDER BY uc.updatedAt DESC;",
            {
                replacements: {
                    userId
                },
                type: QueryTypes.SELECT
            }
        )


        return res.status(200).json({ conversations });
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get conversations!"
        })
    }
}

const setConversation = async ({ senderId, receiverId, conversationId }) => {
    try {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            const newConversation = await Conversation.create({});
            await sequelize.query(
                "INSERT INTO users_conversations(createdAt, updatedAt, userId, conversationId) VALUES (NOW(), NOW(), :senderId, :cvId), (NOW(), NOW(), :receiverId, :cvId)",
                {
                    replacements: {
                        cvId: newConversation.id,
                        senderId,
                        receiverId
                    }
                }
            )
            return newConversation.id;
        }
        return conversationId;
    } catch (error) {
        console.log(error);
        return null;
    }
}


const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        let messages = await Message.findAll({
            where: {
                conversationId
            },
            include: {
                model: Media,
            }
        })

        for (let m of messages) {
            m.dataValues.photos = m.dataValues.Media;
            delete m.dataValues.Media;
        }

        return res.status(200).json({ messages })

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get messages!"
        })
    }
}

const getLastMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        let lastMessage = await Message.findOne({
            where: {
                conversationId
            },
            include: Media,
            order: [['updatedAt', 'DESC']],
        })
        if (!lastMessage) {
            lastMessage = {};
        }

        lastMessage.dataValues.photos = lastMessage.dataValues.Media;
        delete lastMessage.dataValues.Media;

        return res.status(200).json({ lastMessage })
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get last message!"
        })
    }
}

const readConversation = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        if (!conversationId || !userId) {

            return res.status(200).json({
                conversationId: null
            })
        }
        await sequelize.query("UPDATE users_conversations SET isRead = 1 WHERE conversationId = :conversationId AND userId = :userId",
            {
                replacements: {
                    conversationId,
                    userId
                }
            }
        )
        return res.status(200).json({
            conversationId
        })
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Read message fail!"
        })
    }
}

const setMessage = async ({ content, images, conversationId, senderId }) => {
    try {
        let photoNames = [];
        if (images) {
            for (let image of images) {
                if (image) {
                    let photoName = v4() + '.png';
                    let writeStream = fs.createWriteStream(`./src/public/messages-photos/${photoName}`);
                    const imageStream = new Readable();
                    imageStream._read = () => { }
                    imageStream.push(image)
                    imageStream.pipe(writeStream)
                    photoNames.push(photoName);
                }
            }

        }

        const message = await Message.create({ content, conversationId, userId: senderId });
        await Promise.all(photoNames.map(async (name, idx) => {
            let media = await Media.create({ pathName: name, messageId: message.id })
            photoNames[idx] = media;
        }))
        message.photos = photoNames;
        await sequelize.query("UPDATE users_conversations SET updatedAt = NOW(), isRead = 1 " +
            "WHERE conversationId = :conversationId AND userId = :userId",
            {
                replacements: {
                    conversationId,
                    userId: senderId
                }
            }
        )

        await sequelize.query("UPDATE users_conversations SET updatedAt = NOW(), isRead = 0 " +
            "WHERE conversationId = :conversationId AND userId NOT LIKE :userId",
            {
                replacements: {
                    conversationId,
                    userId: senderId
                }
            }
        )

        return message;
    } catch (error) {

        console.log('error', error)
        return null;
    }
}



module.exports = { getConversations, getMessages, getLastMessage, setConversation, setMessage, readConversation }