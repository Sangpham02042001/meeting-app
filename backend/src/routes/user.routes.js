const { Router } = require('express')
const { signup, getUserInfo, updateUserInfo } = require('../controllers/user.controller')

const router = Router()

router.route('/api/signup')
  .post(signup)

router.route('/api/users/:userId')
  .get(getUserInfo)
  .post(updateUserInfo)

module.exports = router