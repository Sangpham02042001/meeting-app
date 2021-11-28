const { getMemberTeam, sendMessage, socketInviteUsers,
    socketConfirmRequest, socketRemoveMember, socketDeleteTeam } = require('../controllers/team.controller');
const { getActiveMemberMeeting, addMemberMeeting,
    joinMeeting, outMeeting, getUserMeeting, getMeetingInfo,
    updateMeetingState, sendMessageMeeting, getMeetingHostId } = require('../controllers/meeting.controller')
const { setConversation, setMessage, removeMessageCv } = require('../controllers/conversation.controller');
const { createTeamNofication, createMessageNotification, createMeetingNofication } = require('../controllers/notification.controller')
const { socketRequestTeam, setUserStatus, getUserStatus,
    socketCancelJoin, socketOutTeam, socketConfirmInvitation } = require('../controllers/user.controller')
const { deleteMessage } = require('../controllers/message.controller');
const Meeting = require('../models/meeting');

const userSockets = {};
const meetingsAudio = {};


const socketServer = (io, socket) => {
    if (!userSockets[socket.userId]) {
        userSockets[socket.userId] = [socket.id]
    } else {
        userSockets[socket.userId].push(socket.id)
    }


    //**********************************USER*************************************//
    socket.on('user-connect', async ({ userId }) => {
        let status = await getUserStatus({ userId });
        if (status === 'inactive') {
            status = 'active';
        }
        let report = await setUserStatus({ userId, status })
        if (report) {
            io.emit('user-changed-status', { userId, status, time: report.time })
        }
    })

    socket.on('user-change-status', async ({ userId, status }) => {
        let report = await setUserStatus({ userId, status })
        if (report) {
            io.emit('user-changed-status', { userId, status, time: report.time })
        }
    })

    //**********************************TEAM*************************************//

    socket.on('send-message-team', async ({ teamId, senderId, content, files, senderName }) => {
        let members = await getMemberTeam({ teamId });
        members = members.filter(m => m.id !== senderId);
        const message = await sendMessage({ teamId, senderId, content, files })
        socket.emit('receive-message-team', { messageId: message.id, content, teamId, senderId, files: message.files, photos: message.photos, createdAt: message.createdAt })
        const { noti } = await createMessageNotification({ teamId, senderId, senderName })
        for (let m of members) {
            if (userSockets[m.id] && userSockets[m.id].length) {
                for (const socketId of userSockets[m.id]) {
                    socket.to(socketId).emit('receive-message-team', { messageId: message.id, teamId, senderId, content, files: message.files, photos: message.photos, createdAt: message.createdAt, noti });
                }
            }
        }
    })

    socket.on('team-invite-users', async ({ teamId, users }) => {
        let result = await socketInviteUsers({ teamId, users })
        if (result.message && result.message === 'success') {
            socket.emit('team-invite-user-success', { users, teamId })
            let { hostName, teamName, hostId } = result
            let createdBy = socket.userId
            let relativeLink = `/teams/${teamId}`
            let content = `${hostName} has invited you to join ${teamName}`
            let noti
            for (const user of users) {
                noti = await createTeamNofication({ userId: user.id, content, relativeLink, createdBy, teamId })
                if (userSockets[user.id] && userSockets[user.id].length) {
                    for (const socketId of userSockets[user.id]) {
                        socket.to(socketId).emit('receive-team-invitation', { noti, teamId, teamName, hostId })
                    }
                }
            }
        }
    })

    socket.on('team-confirm-request', async ({ teamId, userId }) => {
        let result = await socketConfirmRequest({ teamId, userId, hostId: Number(socket.userId) })
        if (result.message && result.message === 'success') {
            socket.emit('team-confirm-user-success', { userId, teamId })
            let { hostName, teamName } = result
            let createdBy = socket.userId
            let relativeLink = `/teams/${teamId}`
            let content = `${hostName} has confirmed your join request to ${teamName}`
            let noti = await createTeamNofication({ userId, content, relativeLink, createdBy, teamId })
            if (userSockets[userId] && userSockets[userId].length) {
                for (const socketId of userSockets[userId]) {
                    socket.to(socketId).emit('receive-team-confirm', { noti, teamId, teamName, hostId: Number(socket.userId) })
                }
            }
        }
    })

    //users (cancel)join team
    socket.on('request-join-team', async ({ team, userName }) => {
        console.log(`userName ${userName} ${socket.userId}`)
        let result = await socketRequestTeam({ team, userId: Number(socket.userId) })
        if (result.message && result.message === 'success') {
            socket.emit('request-join-team-success', {
                team
            })
            let { hostId, teamName } = result
            let createdBy = socket.userId
            let relativeLink = `/teams/${team.id}/setting/requestusers`
            let content = `${userName} has requested to join ${teamName}`
            let noti = await createTeamNofication({ userId: hostId, content, relativeLink, teamId: team.id, createdBy })
            if (userSockets[hostId] && userSockets[hostId].length) {
                for (const socketId of userSockets[hostId]) {
                    socket.to(socketId).emit('receive-team-request', {
                        noti, teamId: team.id, userName, userId: Number(socket.userId)
                    })
                }
            }
        }
    })

    socket.on('cancel-join-request', async ({ teamId }) => {
        console.log(`cancel join ${teamId}`)
        let result = await socketCancelJoin({ teamId, userId: socket.userId })
        if (result && result.hostId) {
            let hostId = result.hostId
            console.log(`team host ${hostId}`)
            socket.emit('cancel-join-success', { teamId })
            if (userSockets[hostId] && userSockets[hostId].length) {
                for (const socketId of userSockets[hostId]) {
                    socket.to(socketId).emit('receive-cancel-join', {
                        teamId, userId: socket.userId
                    })
                }
            }
        }
    })

    socket.on('confirm-invitation', async ({ userName, id, teamId }) => {
        let result = await socketConfirmInvitation({ teamId, userId: id })
        if (result) {
            let { name, hostId } = result
            let members = await getMemberTeam({ teamId })
            members = members.filter(m => m.id != id)
            socket.emit('confirm-invitation-success', {
                id: teamId,
                name,
                hostId
            })
            for (const m of members) {
                if (userSockets[m.id] && userSockets[m.id].length) {
                    for (const socketId of userSockets[m.id]) {
                        socket.to(socketId).emit('new-member', {
                            teamId,
                            userName,
                            id
                        })
                    }
                }
            }
        }
    })

    socket.on('out-team', async ({ teamId }) => {
        let result = await socketOutTeam({ teamId, userId: socket.userId })
        if (result) {
            socket.emit('out-team-success', { teamId })
            let members = await getMemberTeam({ teamId })
            for (let m of members) {
                if (userSockets[m.id] && userSockets[m.id].length) {
                    for (const socketId of userSockets[m.id]) {
                        socket.to(socketId).emit('team-removed-member', { teamId, userId: socket.userId })
                    }
                }
            }
        }
    })

    socket.on('team-remove-message', async ({ teamId, messageId, senderId }) => {
        let report = await deleteMessage({ messageId });
        if (report) {
            let members = await getMemberTeam({ teamId });
            for (let m of members) {
                if (userSockets[m.id] && userSockets[m.id].length) {
                    for (const socketId of userSockets[m.id]) {
                        socket.to(socketId).emit('team-removed-message', { teamId, messageId, senderId });
                    }
                }
            }
            socket.emit('team-removed-message', { teamId, messageId, senderId });
        }
    })

    socket.on('team-remove-member', async ({ teamId, userId }) => {
        let { error } = await socketRemoveMember({ teamId, userId, hostId: socket.userId })
        if (!error) {
            socket.emit('team-removed-member', { teamId, userId })
            let members = await getMemberTeam({ teamId });
            for (let m of members) {
                if (userSockets[m.id] && userSockets[m.id].length) {
                    for (const socketId of userSockets[m.id]) {
                        socket.to(socketId).emit('team-removed-member', { teamId, userId })
                    }
                }
            }
            if (userSockets[userId] && userSockets[userId].length) {
                for (const socketId of userSockets[userId]) {
                    socket.to(socketId).emit('receive-team-remove', { teamId })
                }
            }
        }
    })

    socket.on('delete-team', async ({ teamId }) => {
        let members = await getMemberTeam({ teamId })
        members = members.filter(m => m.id != socket.userId)
        let result = await socketDeleteTeam({ teamId })
        if (result) {
            socket.emit('receive-team-remove', { teamId })
            for (const m of members) {
                if (userSockets[m.id] && userSockets[m.id].length) {
                    for (const socketId of userSockets[m.id]) {
                        socket.to(socketId).emit('receive-team-remove', { teamId })
                    }
                }
            }
        }
    })

    //**********************************TEAM*************************************//


    //**********************************MEETING*************************************//

    socket.on('new-meeting', async ({ meeting, hostName, teamName }) => {
        let { teamId } = meeting
        let members = await getMemberTeam({ teamId });
        let content = `${hostName} starts new meeting at ${teamName}`
        let relativeLink = `/teams/${teamId}`
        let { noti } = await createMeetingNofication({ content, relativeLink, teamId, createdBy: Number(socket.userId) })
        for (let m of members) {
            if (userSockets[m.id] && userSockets[m.id].length) {
                for (const socketId of userSockets[m.id]) {
                    socket.to(socketId).emit('new-meeting-created', { meeting, noti });
                }
            }
        }
        meetingsAudio[meeting.id] = {}
    })

    socket.on("join-meeting", async ({ teamId, meetingId, userId, isAudioActive }) => {
        socket.join(`meeting-${meetingId}`);
        console.log('rooms', socket.rooms);
        let user = await getUserMeeting({ meetingId, userId })
        if (!user) {
            user = await addMemberMeeting({ meetingId, userId });
        } else {
            if (!user.inMeeting) {
                await joinMeeting({ meetingId, userId })
            }
        }
        meetingsAudio[meetingId][userId] = isAudioActive
        let members = await getActiveMemberMeeting({ meetingId }); // luon lay in Meeting
        user = members.find(m => m.userId === user.userId)
        socket.meetingId = meetingId
        let meeting = await getMeetingHostId({ meetingId })
        let hostId
        if (meeting) {
            hostId = meeting.hostId
        }

        socket.emit('joined-meeting', { members, meetingId, teamId, usersAudio: meetingsAudio[meetingId], hostId })

        for (let m of members) {
            console.log(userSockets[m.userId])
            if (userSockets[m.userId] && userSockets[m.userId].length) {
                for (const socketId of userSockets[m.userId]) {
                    socket.to(socketId).emit('user-join-meeting', { teamId, meetingId, user, isAudioActive });
                }
            }
        }
    });

    socket.on('send-message-meeting', async ({ teamId, senderId, content, file, meetingId }) => {
        let members = await getActiveMemberMeeting({ meetingId });
        members = members.filter(m => m.id !== senderId);
        const message = await sendMessageMeeting({ senderId, content, file, meetingId })
        socket.emit('sent-message-meeting', {
            messageId: message.id, content, meetingId, senderId,
            photos: message.photos, teamId, files: message.files, createdAt: message.createdAt
        })

        socket.to(`meeting-${meetingId}`).emit('receive-message-meeting', {
            messageId: message.id, meetingId, senderId, content,
            photos: message.photos, files: message.files, createdAt: message.createdAt
        })
    })

    socket.on('meeting-audio-change', async ({ meetingId, userId, isAudioActive }) => {
        meetingsAudio[meetingId][userId] = isAudioActive
        socket.emit('meeting-user-audio-changed', {
            isAudioActive, userId, meetingId
        })
        socket.to(`meeting-${meetingId}`).emit('meeting-user-audio-changed', {
            isAudioActive, userId, meetingId
        })
    })

    socket.on('force-end-meeting', async ({ teamId }) => {
        console.log(`receive force end meeting`, { teamId })
        let meeting = await Meeting.findOne({
            where: {
                teamId: teamId,
                active: true
            }
        })
        if (meeting && meeting.id) {
            console.log(`meeting active ${meeting.id}`)
            meeting.active = false
            await meeting.save()
            let members = await getMemberTeam({ teamId });
            // members = members.map(m => m.id != socket.userId)
            meeting = await getMeetingInfo({ meetingId: meeting.id })
            for (const member of members) {
                if (userSockets[member.id] && userSockets[member.id].length) {
                    for (const socketId of userSockets[member.id]) {
                        socket.to(socketId).emit('end-meeting', { meeting })
                    }
                }
            }
            socket.emit('end-meeting', { meeting })
            if (userSockets[socket.userId] && userSockets[socket.userId].length) {
                for (const socketId of userSockets[socket.userId]) {
                    socket.to(socketId).emit('receive-end-meeting', {
                        currentMeetingId: meeting.id
                    })
                }
            }
            socket.to(`meeting-${meeting.id}`).emit('receive-end-meeting', {
                currentMeetingId: meeting.id
            })
        }
    })

    //**********************************MEETING*************************************//



    //**********************************CONVERSATION*************************************//

    socket.on('conversation-sendMessage', async ({ content, senderId, receiverId, conversationId, files, senderName }) => {
        let converId = await setConversation({ senderId, receiverId, conversationId });
        let message;
        if (converId) {
            message = await setMessage({ content, conversationId: converId, senderId, files });
        }
        if (message) {
            socket.emit('conversation-receiveMessage', {
                messageId: message.id, content, senderId, receiverId,
                conversationId: converId, files: message.files, photos: message.photos,
                createdAt: message.createdAt, senderName
            })

            const { noti } = await createMessageNotification({ conversationId: converId, senderId, receiverId, senderName })

            if (userSockets[receiverId] && userSockets[receiverId].length) {
                for (const socketId of userSockets[receiverId]) {
                    socket.to(socketId).emit('conversation-receiveMessage', {
                        messageId: message.id, content, senderId, receiverId,
                        conversationId: converId, files: message.files, photos: message.photos,
                        createdAt: message.createdAt, senderName, noti
                    });
                }
            }
        }
    })

    socket.on('conversation-remove-message', async ({ conversationId, messageId, senderId, receiverId }) => {
        let report = await removeMessageCv({ conversationId, messageId, senderId });
        if (report) {
            if (userSockets[receiverId] && userSockets[receiverId].length) {
                for (const socketId of userSockets[receiverId]) {
                    socket.to(socketId).emit('conversation-removed-message', { conversationId, messageId, senderId })
                }
            }
            socket.emit('conversation-removed-message', { conversationId, messageId, senderId })
        }
    })

    socket.on('conversation-call', ({ conversationId, senderId, senderName, receiverId }) => {
        console.log(senderName);
        if (userSockets[receiverId] && userSockets[receiverId].length) {
            for (const socketId of userSockets[receiverId]) {
                socket.to(socketId).emit('conversation-calling', { conversationId, senderId, senderName, receiverId })
            }
        }
    })

    socket.on('conversation-cancel-call', ({ conversationId, senderId, receiverId }) => {
        if (userSockets[receiverId] && userSockets[receiverId].length) {
            for (const socketId of userSockets[receiverId]) {
                socket.to(socketId).emit('cancel-call', { conversationId, senderId, receiverId })
            }
        }
    })

    //**********************************CONVERSATION*************************************//

    //disconnect
    socket.on('disconnect', async () => {
        //meeting
        if (socket.meetingId) {
            let { message } = await outMeeting({
                meetingId: socket.meetingId,
                userId: socket.userId
            })
            let meeting
            if (message) {
                let members = await getActiveMemberMeeting({ meetingId: socket.meetingId });
                if (members.length === 0) {
                    members = await updateMeetingState({ meetingId: socket.meetingId })
                    meeting = await getMeetingInfo({ meetingId: socket.meetingId })
                    for (let m of members) {
                        if (userSockets[m.userId]) {
                            for (const socketId of userSockets[m.userId]) {
                                socket.to(socketId).emit('end-meeting', {
                                    meeting
                                })
                            }
                        }

                    }
                    delete meetingsAudio[socket.meetingId]
                } else {
                    for (const socketId of userSockets[socket.userId]) {
                        socket.to(socketId).emit('own-out-meeting', {
                            meetingId: socket.meetingId
                        })
                    }
                    socket.to(`meeting-${socket.meetingId}`).emit('user-out-meeting', { meetingId: socket.meetingId, userId: socket.userId });
                    if (meetingsAudio[socket.meetingId]) {
                        delete meetingsAudio[socket.meetingId][socket.userId]
                    }
                }
            }
            delete socket.meetingId;
            socket.leave(`meeting-${socket.meetingId}`)
        }

        //user
        let status = await getUserStatus({ userId: socket.userId });
        if (status === 'active') {
            status = 'inactive';
        }
        let report = await setUserStatus({ userId: socket.userId, status });
        if (report) {
            socket.broadcast.emit('user-disconnect', { userId: socket.userId, status, time: report.time })
        }

        userSockets[socket.userId] = userSockets[socket.userId].filter(socketId => socketId != socket.id)
    });
}

module.exports = socketServer;