const { Router } = require('express')
const { updateRead } = require('../controllers/notification.controller')
const { requireSignin } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/notifications/:notiId')
  .put(requireSignin, updateRead)

module.exports = router