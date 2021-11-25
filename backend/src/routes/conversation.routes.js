const { Router } = require('express');
const { requireSignin } = require('../controllers/auth.controller')
const { getConversations, getMessages, getLastMessage, readConversation,
    getImagesMessageCv, getFilesMessageCv, getNumberMessageUnRead } = require('../controllers/conversation.controller')
const router = Router()

router.use('/api/conversations', requireSignin)

router.route('/api/conversations')
    .get(getConversations)

router.route('/api/conversations/messages')
    .get(getNumberMessageUnRead)

router.route('/api/conversations/:conversationId/messages')
    .get(getMessages)

router.route('/api/conversations/:conversationId')
    .patch(readConversation)

router.route('/api/conversations/:conversationId/messages/images')
    .get(getImagesMessageCv)

router.route('/api/conversations/:conversationId/messages/files')
    .get(getFilesMessageCv)

router.route('/api/conversations/:conversationId/messages/lastMessage')
    .get(getLastMessage)

module.exports = router