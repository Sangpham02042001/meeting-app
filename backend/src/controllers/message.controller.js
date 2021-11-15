const Message = require('../models/message')
const Media = require('../models/media')
const fs = require('fs')

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
  let { messageId, mediaId, type } = req.params
  try {
    let media = await Media.findOne({
      where: {
        id: mediaId,
        messageId
      },
      attributes: ['pathName']
    })
    if (!media) {
      return res.status(400).json({ error: 'File not found' })
    }
    if (media.pathName) {
      fs.createReadStream(`./src/public/messages-files/${media.pathName}`).pipe(res)
    }
  } catch (error) {
    return res.status(400).json({ error: 'File not found' })
  }
}


module.exports = { getImageMessage, getImageMessageMedia, getFileMessageMedia }