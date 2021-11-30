const { Router } = require('express')
const { updateRead, deleteNotification, getAllNotifications } = require('../controllers/notification.controller')
const { requireSignin, isAdmin } = require('../controllers/auth.controller')

const router = Router()

router.use('/api/notifications', requireSignin)

router.route('/api/notifications')
  .get(isAdmin, getAllNotifications)

router.route('/api/notifications/:notiId')
  .put(updateRead)
  .delete(deleteNotification)

module.exports = router