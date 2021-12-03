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
        const { id } = req.auth
        const conversations = await sequelize.query(
            "SELECT uc.conversationId, uc.userId as participantId, concat(u.firstName, ' ', u.lastName) as participantName, u.status, tb1.isRead, u.updatedAt as statusTime " +
            "FROM users_conversations uc " +
            "JOIN (SELECT conversationId, isRead FROM users_conversations WHERE userId = :userId) tb1 using(conversationId) " +
            "JOIN users u on uc.userId = u.id " +
            "WHERE uc.userId NOT LIKE :userId " +
            "ORDER BY uc.updatedAt DESC;",
            {
                replacements: {
                    userId: id
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
        let conversation = await sequelize.query(
            "SELECT distinct conversationId " +
            "FROM users_conversations uc " +
            "JOIN (SELECT conversationId FROM users_conversations WHERE userId = :senderId) tb1 using(conversationId) " +
            "WHERE userId = :receiverId ",
            {
                replacements: {
                    senderId, receiverId
                },
                type: QueryTypes.SELECT
            }
        )
        // const conversation = await Conversation.findByPk(conversationId);
        if (!conversation.length) {
            const newConversation = await Conversation.create({});
            await sequelize.query(
                "INSERT INTO users_conversations(createdAt, updatedAt, userId, conversationId) " +
                "VALUES (NOW(), NOW(), :senderId, :cvId), (NOW(), NOW(), :receiverId, :cvId)",
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
            let tmpFiles = [];
            let tmpImages = []
            for (let media of m.dataValues.Media) {
                if (media.type === "image") {
                    tmpImages.push(media)
                } else {
                    tmpFiles.push(media)
                }
            }
            m.dataValues.files = tmpFiles;
            m.dataValues.photos = tmpImages;
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
        if (lastMessage) {
            let tmpFiles = [];
            let tmpImages = []
            for (let media of lastMessage.dataValues.Media) {
                if (media.type === "image") {
                    tmpImages.push(media)
                } else {
                    tmpFiles.push(media)
                }
            }
            lastMessage.dataValues.files = tmpFiles;
            lastMessage.dataValues.photos = tmpImages;
            delete lastMessage.dataValues.Media;
        }

        return res.status(200).json({ lastMessage })
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get last message!"
        })
    }
}

const getNumberMessageUnRead = async (req, res) => {
    try {
        const { id } = req.auth
        const messages = await sequelize.query("SELECT COUNT(*) as total FROM users_conversations WHERE isRead = 0 AND userId = :userId",
            {
                replacements: {
                    userId: id
                },
                type: QueryTypes.SELECT
            }
        )

        return res.status(200).json({
            numberMessages: messages[0].total
        })
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get messages!"
        })
    }
}

const readConversation = async (req, res) => {
    try {
        const { id } = req.auth
        const { conversationId } = req.body;
        if (!conversationId || !id) {

            return res.status(200).json({
                conversationId: null
            })
        }
        await sequelize.query("UPDATE users_conversations SET isRead = 1 WHERE conversationId = :conversationId AND userId = :userId",
            {
                replacements: {
                    conversationId,
                    userId: id
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

const setMessage = async ({ content, files, conversationId, senderId, audio }) => {
    try {
        let multiMedia = [];
        for (let file of files) {
            if (file) {
                let fileName = v4().concat('-', file.name)
                const fileStream = new Readable();
                const writeStream = fs.createWriteStream(`./src/public/messages-${/image\/(?!svg)/.test(file.type) ? 'photos' : 'files'}/${fileName}`)
                fileStream._read = () => { }
                fileStream.push(file.data)
                fileStream.pipe(writeStream)
                multiMedia.push({
                    pathName: fileName,
                    name: file.name,
                    size: file.size,
                    type: /image\/(?!svg)/.test(file.type) ? 'image' : 'file'
                });
            }
        }

        if (audio) {
            let fileName = v4().concat('.wav');
            const fileStream = new Readable();
            const writeStream = fs.createWriteStream(`./src/public/messages-files/${fileName}`)
            fileStream._read = () => { }
            fileStream.push(audio)
            fileStream.pipe(writeStream)
            multiMedia.push({
                pathName: fileName,
                name: fileName,
                size: 0,
                type: 'audio'
            });
        }


        const message = await Message.create({ content, conversationId, userId: senderId });
        await Promise.all(multiMedia.map(async (m, idx) => {
            let media = await Media.create({
                pathName: m.pathName, name: m.name,
                messageId: message.id, type: m.type, size: m.size
            })
            multiMedia[idx] = media;
        }))
        let tmpImages = []
        let tmpFiles = []
        for (let media of multiMedia) {
            if (media.type === "image") {
                tmpImages.push(media)
            } else {
                tmpFiles.push(media)
            }
        }
        message.files = tmpFiles;
        message.photos = tmpImages
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

const getImagesMessageCv = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const images = await sequelize.query(
            "SELECT m.id, msg.id as messageId, m.createdAt FROM media m " +
            "JOIN messages msg on msg.id = m.messageId " +
            "JOIN conversations cv on cv.id = msg.conversationId " +
            "WHERE msg.conversationId = :conversationId AND m.type = 'image'" +
            "ORDER BY m.updatedAt DESC"
            , {
                replacements: {
                    conversationId
                },
                type: QueryTypes.SELECT
            })

        return res.status(200).json({ images })

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get images!"
        })
    }
}

const getFilesMessageCv = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const files = await sequelize.query(
            "SELECT m.id, m.messageId, m.name, m.size, m.type, m.createdAt FROM media m " +
            "JOIN messages msg on msg.id = m.messageId " +
            "JOIN conversations cv on cv.id = msg.conversationId " +
            "WHERE msg.conversationId = :conversationId AND m.type = 'file' " +
            "ORDER BY m.updatedAt DESC"
            , {
                replacements: {
                    conversationId
                },
                type: QueryTypes.SELECT
            })

        return res.status(200).json({ files })

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            message: "Could not get files!"
        })
    }
}

const getParticipantId = async ({ userId, conversationId }) => {
    try {
        const participantId = await sequelize.query(
            "SELECT userId as participantId " +
            "FROM users_conversations " +
            "WHERE conversationId = :conversationId AND userId NOT LIKE :userId ",
            {
                replacements: {
                    userId,
                    conversationId
                },
                type: QueryTypes.SELECT
            }
        )

        return (participantId[0] || {}).participantId;
    } catch (error) {
        console.log(error)
        return null;
    }
}




module.exports = {
    getConversations, getMessages, getLastMessage,
    setConversation, setMessage, readConversation, getImagesMessageCv,
    getFilesMessageCv, getNumberMessageUnRead, getParticipantId
}