const { Router } = require('express')
const {  getImageMessage, downloadFileMessage,
  downloadImageMessage, delMessage } = require('../controllers/message.controller')
const router = Router()

router.route('/api/messages/:messageId')
  .delete(delMessage)

router.route('/api/messages/:messageId/image/:mediaId')
  .get(getImageMessage)

router.route('/api/messages/:messageId/files/:mediaId')
  .get(downloadFileMessage)

router.route('/api/messages/:messageId/photos/:mediaId')
  .get(downloadImageMessage)

module.exports = router