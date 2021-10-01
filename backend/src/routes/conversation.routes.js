const { Router } = require('express');
const { requireSignin } = require('../controllers/auth.controller')
const { getConversationsOfUser, getParticipantInfo, getMessagesConversation, getLastMessage } = require('../controllers/conversation.controller')
const router = Router()

router.route('/api/conversations/users/:userId')
    .get(requireSignin, getConversationsOfUser)

router.route('/api/conversations/:conversationId/users/:userId')
    .get(requireSignin, getParticipantInfo)

router.route('/api/conversations/:conversationId/messages')
    .get(requireSignin, getMessagesConversation)

router.route('/api/conversations/:conversationId/messages/lastMessage')
    .get(requireSignin, getLastMessage)

module.exports = router