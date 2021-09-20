const { getMeetingInfo } = require('../controllers/meeting.controller')
const { Router } = require('express')

const router = Router()

router.route('/api/meetings/:meetingId')
  .get(getMeetingInfo)

module.exports = router