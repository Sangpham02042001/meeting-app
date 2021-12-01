const { Router } = require('express')
const { getImageMessage, downloadFileMessage,
  downloadImageMessage, delMessage, getMessages, editMessage } = require('../controllers/message.controller')
const { isAdmin, requireSignin } = require('../controllers/auth.controller')
const router = Router()

router.route('/api/messages/:messageId')
  .delete(delMessage)
  .put(requireSignin, isAdmin, editMessage)

router.route('/api/messages/:messageId/image/:mediaId')
  .get(getImageMessage)

router.route('/api/messages/:messageId/files/:mediaId')
  .get(downloadFileMessage)

router.route('/api/messages/:messageId/photos/:mediaId')
  .get(downloadImageMessage)

router.route('/api/messages')
  .get(requireSignin, isAdmin, getMessages)

module.exports = router