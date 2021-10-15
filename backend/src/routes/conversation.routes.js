const { Router } = require('express');
const { requireSignin } = require('../controllers/auth.controller')
const { getConversations, getMessages, getLastMessage } = require('../controllers/conversation.controller')
const router = Router()

router.route('/api/conversations/users/:userId')
    .get(requireSignin, getConversations)

router.route('/api/conversations/:conversationId/messages')
    .get(requireSignin, getMessages)

router.route('/api/conversations/:conversationId/messages/lastMessage')
    .get(requireSignin, getLastMessage)

module.exports = router