const { Router } = require('express')
const { signup, getUserInfo, updateUserInfo, getUserAvatar,
  requestJoinTeam } = require('../controllers/user.controller')
const { requireSignin } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/signup')
  .post(signup)

router.route('/api/users/teams/:teamId')
  .post(requireSignin, requestJoinTeam)

router.route('/api/users/:userId')
  .get(getUserInfo)
  .put(requireSignin, updateUserInfo)

router.route('/api/user/avatar/:userId')
  .get(getUserAvatar)

module.exports = router