const { getTeamInfo } = require('../controllers/team.controller')
const { Router } = require('express')

const router = Router()

router.route('/api/team/:teamId')
  .get(getTeamInfo)

module.exports = router