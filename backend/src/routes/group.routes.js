const { getGroupInfo } = require('../controllers/group.controller')
const { Router } = require('express')

const router = Router()

router.route('/api/groups/:groupId')
  .get(getGroupInfo)

module.exports = router