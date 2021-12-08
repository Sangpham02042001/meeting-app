const { Router } = require('express')
const { isAdmin, requireSignin } = require('../controllers/auth.controller')
const { adminSignin, getAllUsers, deleteUser, updateUserInfo,
    changePassword, getFeedbacks, updateFeedback, deleteFeedback } = require('../controllers/admin.controller')
const router = Router()

router.route('/api/signin')
    .post(adminSignin)

router.use('/api/users', requireSignin, isAdmin)

router.route('/api/users')
    .get(getAllUsers)

router.route('/api/users/:userId')
    .put(updateUserInfo)
    .patch(changePassword)
    .delete(deleteUser)

router.route('/api/feedbacks')
    .get(requireSignin, isAdmin, getFeedbacks)

router.route('/api/feedbacks/:feedbackId')
    .put(updateFeedback)
    .delete(deleteFeedback)

module.exports = router