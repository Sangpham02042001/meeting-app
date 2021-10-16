const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message')
const sequelize = require('../models');
const { Op } = require("sequelize");
const fs = require('fs');
const { v4 } = require('uuid');
const { Readable } = require('stream');

const getConversations = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const conversations = await sequelize.query(
            "SELECT conversationId, userId as participantId FROM users_conversations WHERE conversationId IN (SELECT conversationId FROM users_conversations where userId = :userId) AND userId not like :userId ORDER BY createdAt DESC",
            {
                replacements: {
                    userId
                }
            }
        )

        if (!conversations) {
            err = new Error('Conversations could not find')
            err.status = 403;
            return next(err);
        }


        console.log(conversations[0])

        return res.status(200).json({ conversations: conversations[0] });
    } catch (error) {
        return next(error);
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


const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        let messages = await Message.findAll({
            where: {
                conversationId
            }
        })

        if (!messages) {
            err = new Error('Messages could not find!')
            err.status = 403;
            return next(err);
        }

        messages = messages.map(mess => {
            mess.teamId = undefined;
            return mess;
        })

        return res.status(200).json({ messages })

    } catch (error) {
        next(error);
    }
}

const getLastMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const lastMessage = await Message.findOne({
            where: {
                conversationId
            },
            order: [['createdAt', 'DESC']],
        })
        if (!lastMessage) {
            return {lastMessage: {}};
        }

        lastMessage.teamId = undefined;


        return res.status(200).json({ lastMessage })

    } catch (error) {
        next(error);
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
        if (!message) {
            return null;
        }
        return message;
    } catch (error) {
        console.log(error)
        return null;
    }

}

module.exports = { getConversations, getMessages, getLastMessage, setConversation, setMessage }