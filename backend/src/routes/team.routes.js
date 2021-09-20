const { Router } = require('express')
const { requireSignin } = require('../controllers/auth.controller')
const { getTeamInfo, createTeam } = require('../controllers/team.controller')

const router = Router()

router.route('/api/teams')
  .post(requireSignin, createTeam)

router.route('/api/team/:teamId')
  .get(getTeamInfo)

module.exports = router