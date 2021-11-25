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
const { isTeamAdmin, isMember } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/teams/search')
  .post(requireSignin, searchTeams)

router.route('/api/teams/search-with-code')
  .get(requireSignin, searchTeamWithCode);

router.route('/api/teams/:teamId/members')
  .get(getTeamMembers)
// .get(requireSignin, getTeamMembers)

router.route('/api/teams/:teamId/meetings')
  .get(getTeamMeetings)
// .get(requireSignin, getMeetings)

router.route('/api/teams/:teamId/meetingactive')
  .get(requireSignin, getMeetingActive)

router.route('/api/teams/:teamId/requestusers')
  .get(getTeamRequestUsers)
// .get(requireSignin, getTeamRequestUsers)

router.route('/api/teams/:teamId/invited-users')
  .get(getTeamInvitedUsers)
// .get(requireSignin, getTeamInvitedUsers)

router.route('/api/teams/:teamId/files')
  .get(requireSignin, getTeamSharedFiles)

router.route('/api/teams/:teamId/images')
  .get(requireSignin, getTeamSharedImages)

router.route('/api/teams/:teamId/users')
  .post(requireSignin, isTeamAdmin, inviteUsers)
  .put(requireSignin, isTeamAdmin, removeInvitations)


router.route('/api/teams/:teamId/remove-requests')
  .put(requireSignin, isTeamAdmin, removeUserRequests)

router.route('/api/teams/:teamId/meetmess')
  .get(requireSignin, isMember, getTeamMeetMess)

router.route('/api/teams/:teamId/remove-members')
  .put(requireSignin, isTeamAdmin, removeMembers)

router.route('/api/teams/:teamId')
  //need backup
  // .get(requireSignin, getTeamInfo)
  // .put(requireSignin, isTeamAdmin, updateBasicTeamInfo)
  .get(getTeamInfo)
  .put(updateBasicTeamInfo)
  .delete(requireSignin, isTeamAdmin, removeTeam)

router.route('/api/teams')
  .post(requireSignin, createTeam)

router.route('/api/team/coverphoto/:teamId')
  .get(getTeamCoverPhoto)

router.route('/api/teams')
  .get(getAllTeams)

module.exports = router