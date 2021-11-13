const { Router } = require('express')
const { getImageMessage, getImageMessageMedia } = require('../controllers/message.controller')
const router = Router()

router.route('/api/messages/:messageId/image')
  .get(getImageMessage)

router.route('/api/messages/:messageId/:mediaId')
  .get(getImageMessageMedia)



module.exports = router