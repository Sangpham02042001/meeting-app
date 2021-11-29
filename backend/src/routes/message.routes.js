const { Router } = require('express')
const { getImageMessage, getImageMessageMedia, getFileMessageMedia,
  downloadImageMessageMedia, delMessage } = require('../controllers/message.controller')
const router = Router()

router.route('/api/messages/:messageId')
  .delete(delMessage)

router.route('/api/messages/:messageId/image')
  .get(getImageMessage)

router.route('/api/messages/:messageId/:mediaId')
  .get(getImageMessageMedia)

router.route('/api/messages/files/:messageId/:mediaId')
  .get(getFileMessageMedia)

router.route('/api/messages/photos/:messageId/:mediaId')
  .get(downloadImageMessageMedia)

module.exports = router