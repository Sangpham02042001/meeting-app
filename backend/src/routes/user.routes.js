const { Router } = require('express')
const { signup, getUserInfo, updateUserInfo, getUserAvatar,
  requestJoinTeam, getJoinedTeams, getRequestingTeams,
  outTeam, cancelJoinRequest, confirmInvitations,
  removeInvitations, getInvitations } = require('../controllers/user.controller')
const { requireSignin } = require('../controllers/auth.controller')

const router = Router()

router.route('/api/signup')
  .post(signup)

router.route('/api/users/teams/:teamId')
  .post(requireSignin, requestJoinTeam)

router.route('/api/users/:userId/teams')
  .get(requireSignin, getJoinedTeams)

router.route('/api/users/:userId/confirm-invitations')
  .post(requireSignin, confirmInvitations)

router.route('/api/users/:userId/remove-invitations')
  .put(requireSignin, removeInvitations)

router.route('/api/users/:userId/teams/:teamId')
  .delete(requireSignin, outTeam)

router.route('/api/users/:userId/requesting-teams')
  .get(requireSignin, getRequestingTeams)

router.route('/api/users/:userId/invitations')
  .get(requireSignin, getInvitations)

router.route('/api/users/:userId/requesting-teams/:teamId')
  .delete(requireSignin, cancelJoinRequest)

router.route('/api/users/:userId')
  .get(getUserInfo)
  .put(requireSignin, updateUserInfo)

router.route('/api/user/avatar/:userId')
  .get(getUserAvatar)


module.exports = router