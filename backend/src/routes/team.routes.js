const { Router } = require('express')
const { requireSignin } = require('../controllers/auth.controller')
const { getTeamInfo, createTeam, getTeamCoverPhoto,
  getTeamMembers, getTeamRequestMembers } = require('../controllers/team.controller')

const router = Router()

router.route('/api/teams/:teamId/members')
  .get(requireSignin, getTeamMembers)

router.route('/api/teams/:teamId/requestmembers')
  .get(requireSignin, getTeamRequestMembers)

router.route('/api/teams/:teamId')
  .get(getTeamInfo)

router.route('/api/teams')
  .post(requireSignin, createTeam)

router.route('/api/team/coverphoto/:teamId')
  .get(getTeamCoverPhoto)

module.exports = router