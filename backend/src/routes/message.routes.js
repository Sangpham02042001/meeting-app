const { Router } = require('express')
const { getImageMessage } = require('../controllers/message.controller')
const router = Router()

router.route('/api/messages/:messageId/image')
  .get(getImageMessage)


module.exports = router