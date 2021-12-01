const Message = require('../models/message')
const Media = require('../models/media')
const fs = require('fs');
const { QueryTypes } = require("sequelize");
const sequelize = require('../models');
const User = require('../models/user');



const getImageMessage = async (req, res) => {
  let { messageId, mediaId } = req.params
  try {
    let media = await Media.findOne({
      where: {
        id: mediaId,
        messageId
      },
      attributes: ['pathName']
    })
    if (!media) {
      return res.status(400).json({ error: 'Image not found' })
    }
    if (media.pathName) {
      fs.createReadStream(`./src/public/messages-photos/${media.pathName}`).pipe(res)
    }
  } catch (error) {
    return res.status(400).json({ error: 'Image not found' })
  }
}

const downloadFileMessage = async (req, res) => {
  let { messageId, mediaId } = req.params
  try {
    let media = await Media.findOne({
      where: {
        id: mediaId,
        messageId
      },
    })

    if (!media) {
      return res.status(400).json({ error: 'File not found' })
    }

    if (media.pathName) {
      let file = `./src/public/messages-files/${media.pathName}`;
      let fileStream = fs.createReadStream(file);
      res.setHeader('Content-disposition', 'attachment; filename=' + media.name);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error: 'File not found' })
  }
}

const downloadImageMessage = async (req, res) => {
  let { messageId, mediaId } = req.params
  try {
    let media = await Media.findOne({
      where: {
        id: mediaId,
        messageId
      },
    })
    if (!media) {

      return res.status(400).json({ error: 'File not found' })
    }

    if (media.pathName) {
      let file = `./src/public/messages-photos/${media.pathName}`;
      let fileStream = fs.createReadStream(file);
      res.setHeader('Content-disposition', 'attachment; filename=' + media.name);
      fileStream.pipe(res);
    }
  } catch (error) {
    return res.status(400).json({ error: 'File not found' })
  }
}

const deleteMessage = async ({ messageId }) => {
  try {
    let media = await Media.findOne({
      where: {
        messageId
      },
      attributes: ['id', 'pathName', 'type']
    })

    await sequelize.query(
      "DELETE FROM messages " +
      "WHERE id = :messageId"
      , {
        replacements: {
          messageId
        },
        type: QueryTypes.DELETE
      })

    if ((media || {}).type === 'image') {
      fs.unlink(`./src/public/messages-photos/${media.pathName}`, (err) => {
        if (err) {
          console.log(err)
          return null;
        }
      })
    } else if ((media || {}).type === 'file' || (media || {}).type === 'audio') {
      fs.unlink(`./src/public/messages-files/${media.pathName}`, (err) => {
        if (err) {
          console.log(err)
          return null;
        }
      })
    }

    return 'success';

  } catch (error) {
    console.log(error);
    return null;
  }
}

const delMessage = async (req, res) => {
  let { messageId } = req.params
  let result = await deleteMessage({ messageId })
  if (result) {
    return res.status(200).json({ message: 'Delete success' })
  }
  else {
    return res.status(400).json({ error: 'Something wrong' })
  }
}

const getMessages = async (req, res) => {
  try {
    let { offset, num } = req.query
    let numOfMessages
    let messages = await Message.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
        { model: Media, attributes: ['id', 'type'] }
      ],
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC']
      ]
    })
    numOfMessages = messages.length
    messages = messages.slice(offset, offset + num)
    return res.status(200).json({ messages, numOfMessages })
  } catch (error) {
    return res.status(400).json({ error: 'Something wrong' })
  }
}

const editMessage = async (req, res) => {
  try {
    let { messageId } = req.params
    let { content } = req.body
    let message = await Message.findOne({
      where: {
        id: messageId
      }
    })
    if (!message) {
      throw 'Message not found'
    }
    message.content = content
    await message.save()
    return res.status(200).json({ 'message': 'Edit successfully' })
  } catch (error) {
    return res.status(400).json({ error: 'Something wrong' })
  }
}

module.exports = {
  getImageMessage, downloadFileMessage,
  downloadImageMessage, deleteMessage, delMessage,
  deleteMessage, delMessage,
  getMessages, editMessage
}