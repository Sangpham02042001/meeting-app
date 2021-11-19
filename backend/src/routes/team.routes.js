const { Router } = require('express')
const { requireSignin } = require('../controllers/auth.controller')
const { getTeamInfo, createTeam, getTeamCoverPhoto,
  getTeamMembers, getTeamRequestUsers,
  confirmUserRequests, removeUserRequests, removeMembers,
  removeTeam, inviteUsers, removeInvitations,
  getTeamInvitedUsers, searchTeams, updateBasicTeamInfo,
  sendMessage, getTeamMessages, getMeetings,
  getTeamMeetMess, searchTeamWithCode } = require('../controllers/team.controller')
const { isAdmin, isMember } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/teams/search')
  .post(requireSignin, searchTeams)

router.route('/api/teams/search-with-code')
  .get(requireSignin, searchTeamWithCode);

router.route('/api/teams/:teamId/members')
  .get(requireSignin, getTeamMembers)

router.route('/api/teams/:teamId/meetings')
  .get(requireSignin, getMeetings)

router.route('/api/teams/:teamId/requestusers')
  .get(requireSignin, getTeamRequestUsers)

router.route('/api/teams/:teamId/invited-users')
  .get(requireSignin, getTeamInvitedUsers)

router.route('/api/teams/:teamId/users')
  .post(requireSignin, isAdmin, inviteUsers)
  .put(requireSignin, isAdmin, removeInvitations)

router.route('/api/teams/:teamId/confirm-requests')
  .put(requireSignin, isAdmin, confirmUserRequests)

router.route('/api/teams/:teamId/remove-requests')
  .put(requireSignin, isAdmin, removeUserRequests)

router.route('/api/teams/:teamId/messages')
  .post(requireSignin, isMember, sendMessage)
  .get(requireSignin, isMember, getTeamMessages)

router.route('/api/teams/:teamId/meetmess')
  .get(requireSignin, isMember, getTeamMeetMess)

router.route('/api/teams/:teamId/remove-members')
  .put(requireSignin, isAdmin, removeMembers)

router.route('/api/teams/:teamId')
  .get(requireSignin, getTeamInfo)
  .put(requireSignin, isAdmin, updateBasicTeamInfo)
  .delete(requireSignin, isAdmin, removeTeam)

router.route('/api/teams')
  .post(requireSignin, createTeam)

router.route('/api/team/coverphoto/:teamId')
  .get(getTeamCoverPhoto)

module.exports = router