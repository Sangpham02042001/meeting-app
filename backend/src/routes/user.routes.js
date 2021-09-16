const { Router } = require('express')
const { signup } = require('../controllers/user.controller')

const router = Router()

router.route('/api/signup')
  .post(signup)

module.exports = router