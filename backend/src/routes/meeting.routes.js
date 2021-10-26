const { getMeetingInfo, createMeeting } = require('../controllers/meeting.controller')
const { requireSignin } = require('../controllers/auth.controller')
const { Router } = require('express')

const router = Router()

router.route('/api/meetings')
  .post(requireSignin, createMeeting)

router.route('/api/meetings/:meetingId')
  .get(requireSignin, getMeetingInfo)

module.exports = router