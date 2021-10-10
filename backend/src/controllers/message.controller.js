const Message = require('../models/message')
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
    return res.status(400).json({ error: 'Team not found' })
  }
  if (message.photo) {
    fs.createReadStream(`./src/public/messages-photos/${message.photo}`).pipe(res)
  }
}

module.exports = { getImageMessage }