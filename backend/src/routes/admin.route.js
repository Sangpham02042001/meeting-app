const { Router } = require('express')
const { isAdmin, requireSignin } = require('../controllers/auth.controller')
const { adminSignin, getAllUsers, deleteUser, updateUserInfo, changePassword, getFeedbacks } = require('../controllers/admin.controller')
const router = Router()




router.route('/api/signin')
    .post(adminSignin)

router.use(requireSignin, isAdmin)

router.route('/api/users')
    .get(getAllUsers)

router.route('/api/users/:userId')
    .put(updateUserInfo)
    .patch(changePassword)
    .delete(deleteUser)

router.route('/api/user/feedback')
    .get(getFeedbacks)

module.exports = router