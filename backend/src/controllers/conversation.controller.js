const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message')
const sequelize = require('../models');
const { Op } = require("sequelize");

const getConversationsOfUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await sequelize.query(
            "SELECT conversationId FROM users_conversations WHERE userId = :userId",
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

        return res.status(200).json({ conversations: conversations[0] });
    } catch (error) {
        return next(error);
    }
}

const getParticipantInfo = async (req, res, next) => {
    const { conversationId, userId } = req.params;
    try {
        const participantId = await sequelize.query(
            "SELECT userId FROM users_conversations WHERE conversationId = :conversationId AND userId NOT LIKE :userId",
            {
                replacements: {
                    conversationId,
                    userId
                }
            }
        )

        if (!participantId) {
            err = new Error('ParticipantId could not find!')
            err.status = 403;
            return next(err);
        }

        const participantInfo = await sequelize.query(

            "SELECT CONCAT(u.firstName, ' ', u.lastName) as userName, u.id, u.email  FROM users u WHERE id = :userId",
            {
                replacements: {
                    userId: participantId[0][0].userId
                }
            }
        )

        if (!participantInfo) {
            err = new Error('ParticipantInfo could not find!')
            err.status = 403;
            return next(err);
        }


        return res.status(200).json({ participant: participantInfo[0][0] })
    } catch (error) {
        return next(error);
    }
}

const getMessagesConversation = async (req, res, next) => {
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
            err = new Error('Last message could not find!')
            err.status = 403;
            return next(err);
        }

        lastMessage.teamId = undefined;


        return res.status(200).json({ lastMessage })

    } catch (error) {
        next(error);
    }
}

module.exports = { getConversationsOfUser, getParticipantInfo, getMessagesConversation, getLastMessage }