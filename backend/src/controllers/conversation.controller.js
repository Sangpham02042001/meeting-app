const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message')
const sequelize = require('../models');
const { Op, QueryTypes } = require("sequelize");
const fs = require('fs');
const { v4 } = require('uuid');
const { Readable } = require('stream');

const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await sequelize.query(
            "SELECT conversationId, userId as participantId, isRead FROM users_conversations WHERE conversationId IN (SELECT conversationId FROM users_conversations where userId = :userId) AND userId not like :userId ORDER BY updatedAt DESC",
            {
                replacements: {
                    userId
                },
                type: QueryTypes.SELECT
            }
        )


        return res.status(200).json({ conversations });
    } catch (error) {
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
            }
        })

        messages = messages.map(mess => {
            mess.teamId = undefined;
            return mess;
        })

        return res.status(200).json({ messages })

    } catch (error) {
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
            order: [['updatedAt', 'DESC']],
        })
        if (!lastMessage) {
            lastMessage = {};
        }

        lastMessage.teamId = undefined;

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
        const {conversationId} = req.params;
        await sequelize.query("UPDATE users_conversations SET isRead = 1 WHERE conversationId = :conversationId",
            {
                replacements: {
                    conversationId
                }
            }
        )
        return res.status(200).json({
            conversationId
        })
    } catch (error) {
        return res.status(403).json({
            message: "Read message fail!"
        })
    }
}

const setMessage = async ({ content, image, conversationId, senderId }) => {
    try {
        let photoName = null;
        if (image) {
            photoName = v4() + '.png';
            let writeStream = fs.createWriteStream(`./src/public/messages-photos/${photoName}`);
            const imageStream = new Readable();
            imageStream._read = () => { }
            imageStream.push(image)
            imageStream.pipe(writeStream)
        }
        const message = await Message.create({ content, photo: photoName, conversationId, userId: senderId });

        await sequelize.query("UPDATE users_conversations SET updatedAt = NOW(), isRead = 0 WHERE conversationId = :conversationId",
            {
                replacements: {
                    conversationId
                }
            }
        )


        if (!message) {
            return null;
        }
        return message;
    } catch (error) {
        console.log(error)
        return null;
    }
}



module.exports = { getConversations, getMessages, getLastMessage, setConversation, setMessage, readConversation }