const { getMeetingInfo, createMeeting, getMeetingMessages,
  getCurrentMeeting, getMeetingById, getAllMeetings } = require('../controllers/meeting.controller')
const { requireSignin, isAdmin } = require('../controllers/auth.controller')
const { Router } = require('express')

const router = Router()

router.use('/api/meetings', requireSignin)

router.route('/api/meetings')
  .post(createMeeting)

router.route('/api/meetings/current-meeting')
  .get(getCurrentMeeting)

router.route('/api/meetings/:meetingId/messages')
  .get(getMeetingMessages)

router.route('/api/meetings/:meetingId')
  .get(getMeetingById)

router.route('/api/meetings')
  .get(isAdmin, getAllMeetings)

module.exports = router