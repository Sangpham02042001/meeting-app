const { getMeetingInfo, createMeeting, getMeetingMessages,
  getCurrentMeeting, getMeetingById } = require('../controllers/meeting.controller')
const { requireSignin } = require('../controllers/auth.controller')
const { Router } = require('express')

const router = Router()

router.route('/api/meetings')
  .post(requireSignin, createMeeting)

router.route('/api/meetings/current-meeting')
  .get(requireSignin, getCurrentMeeting)

router.route('/api/meetings/:meetingId/messages')
  .get(requireSignin, getMeetingMessages)

router.route('/api/meetings/:meetingId')
  .get(requireSignin, getMeetingById)

module.exports = router