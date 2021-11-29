const Message = require('../models/message')
const Media = require('../models/media')
const fs = require('fs');
const { QueryTypes } = require("sequelize");
const sequelize = require('../models')

const getImageMessage = async (req, res) => {
  let { messageId } = req.params
  let message = await Message.findOne({
    where: {
      id: messageId
    },
    attributes: ['photo']
  })
  if (!message) {
    return res.status(400).json({ error: 'Image not found' })
  }
  if (message.photo) {
    fs.createReadStream(`./src/public/messages-photos/${message.photo}`).pipe(res)
  }
}

const getImageMessageMedia = async (req, res) => {
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

const getFileMessageMedia = async (req, res) => {
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
    return res.status(400).json({ error: 'File not found' })
  }
}

const downloadImageMessageMedia = async (req, res) => {
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
    } else if ((media || {}).type === 'file') {
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

module.exports = {
  getImageMessage, getImageMessageMedia, getFileMessageMedia,
  downloadImageMessageMedia, deleteMessage, delMessage
}