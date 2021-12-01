const { Router } = require('express')
const { getImageMessage, getImageMessageMedia, getFileMessageMedia,
  downloadImageMessageMedia, delMessage, getMessages,
  editMessage } = require('../controllers/message.controller')
const { isAdmin, requireSignin } = require('../controllers/auth.controller')
const router = Router()

router.route('/api/messages/:messageId')
  .delete(delMessage)
  .put(requireSignin, isAdmin, editMessage)

router.route('/api/messages/:messageId/image')
  .get(getImageMessage)

router.route('/api/messages/:messageId/:mediaId')
  .get(getImageMessageMedia)

router.route('/api/messages/files/:messageId/:mediaId')
  .get(getFileMessageMedia)

router.route('/api/messages/photos/:messageId/:mediaId')
  .get(downloadImageMessageMedia)

router.route('/api/messages')
  .get(requireSignin, isAdmin, getMessages)

module.exports = router