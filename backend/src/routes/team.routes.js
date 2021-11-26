const { Router } = require('express')
const { requireSignin } = require('../controllers/auth.controller')
const { getTeamInfo, createTeam, getTeamCoverPhoto,
  getTeamMembers, getTeamRequestUsers,
  removeUserRequests, removeMembers,
  removeTeam, inviteUsers, removeInvitations,
  getTeamInvitedUsers, searchTeams, updateBasicTeamInfo,
  getMeetings, getTeamMeetMess, searchTeamWithCode,
  getTeamSharedFiles, getTeamSharedImages, getMeetingActive,
  getAllTeams,
  getTeamMeetings } = require('../controllers/team.controller')
const { isTeamAdmin, isMember, isAdmin } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/team/coverphoto/:teamId')
  .get(getTeamCoverPhoto)

router.use('/api/teams', requireSignin)

router.route('/api/teams/search')
  .post(searchTeams)

router.route('/api/teams/search-with-code')
  .get(searchTeamWithCode);

router.route('/api/teams/:teamId/members')
  .get(getTeamMembers)

router.route('/api/teams/:teamId/meetings')
  .get(getMeetings)

router.route('/api/teams/:teamId/meetingactive')
  .get(getMeetingActive)

router.route('/api/teams/:teamId/requestusers')
  .get(getTeamRequestUsers)

router.route('/api/teams/:teamId/invited-users')
  .get(getTeamInvitedUsers)

router.route('/api/teams/:teamId/files')
  .get(requireSignin, getTeamSharedFiles)

router.route('/api/teams/:teamId/images')
  .get(getTeamSharedImages)

router.route('/api/teams/:teamId/users')
  .post(isTeamAdmin, inviteUsers)
  .put(isTeamAdmin, removeInvitations)


router.route('/api/teams/:teamId/remove-requests')
  .put(isTeamAdmin, removeUserRequests)

router.route('/api/teams/:teamId/meetmess')
  .get(isMember, getTeamMeetMess)

router.route('/api/teams/:teamId/remove-members')
  .put(isTeamAdmin, removeMembers)

router.route('/api/teams/:teamId')
  .get(getTeamInfo)
  .put(isTeamAdmin, updateBasicTeamInfo)
  .delete(isTeamAdmin, removeTeam)

router.route('/api/teams')
  .post(createTeam)

router.route('/api/teams')
  .get(isAdmin, getAllTeams)

module.exports = router