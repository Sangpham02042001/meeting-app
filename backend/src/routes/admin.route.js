const { Router } = require('express')
const { isAdmin, requireSignin } = require('../controllers/auth.controller')
const { adminSignin, getAllUsers } = require('../controllers/admin.controller')
const router = Router()




router.route('/api/signin')
    .post(adminSignin)

router.use(requireSignin, isAdmin)

router.route('/api/users')
    .get(getAllUsers)

module.exports = router