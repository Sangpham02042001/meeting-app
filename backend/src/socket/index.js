const users = {};
const socketToMeeting = {};

const { getMemberTeam, sendMessage } = require('../controllers/team.controller');
const { getActiveMemberMeeting, addMemberMeeting,
    joinMeeting, outMeeting, getUserMeeting,
    updateMeetingState, sendMessageMeeting } = require('../controllers/meeting.controller')
const { setConversation, setMessage } = require('../controllers/conversation.controller');



const socketServer = (socket) => {
    // socket.on("join-meeting", meetingId => {
    //     if (users[meetingId]) {

    //         users[meetingId].push(socket.id);
    //     } else {
    //         users[meetingId] = [socket.id];
    //     }
    //     socket.join(meetingId);
    //     socketToMeeting[socket.id] = meetingId;
    //     const usersInThisRoom = users[meetingId].filter(id => id !== socket.id);
    //     console.log(socket.id);
    //     socket.emit("all-users", usersInThisRoom);



    //     socket.on('disconnect-meeting', () => {
    //         const meetingId = socketToMeeting[socket.id];
    //         let room = users[meetingId];
    //         if (room) {
    //             room = room.filter(id => id !== socket.id);
    //             users[meetingId] = room;
    //             socket.broadcast.to(meetingId).emit('disconnected-meeting', socket.id);
    //         }
    //     })

    //     socket.on('send-message-team', ({ message, userId }) => {
    //         socket.broadcast.to(meetingId).emit('receive-message-team', { message, userId });
    //     })
    // });
    //team
    socket.on('send-message-team', async ({ teamId, senderId, content, image }) => {
        let members = await getMemberTeam({ teamId });
        members = members.filter(m => m.id !== senderId);
        const message = await sendMessage({ teamId, senderId, content, image })
        socket.emit('sent-message-team', { messageId: message.id, content, teamId, senderId, photo: message.photo })
        console.log('sent-message-team', socket.id)
        for (let m of members) {
            socket.to(m.id).emit('receive-message-team', { messageId: message.id, teamId, senderId, content, photo: message.photo });
        }
    })


    //meeting
    socket.on("join-meeting", async ({ teamId, meetingId, userId }) => {
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
        let members = await getActiveMemberMeeting({ meetingId }); // luon lay in Meeting
        user = members.find(m => m.userId === user.userId)
        socket.meetingId = meetingId

        socket.emit('joined-meeting', { members, meetingId, teamId })

        for (let m of members) {
            socket.to(m.userId).emit('user-join-meeting', { teamId, meetingId, user });
        }
    });

    socket.on('send-message-meeting', async ({ teamId, senderId, content, image, meetingId }) => {
        let members = await getActiveMemberMeeting({ meetingId });
        members = members.filter(m => m.id !== senderId);
        const message = await sendMessageMeeting({ senderId, content, image, meetingId })
        socket.emit('sent-message-meeting', { messageId: message.id, content, meetingId, senderId, photo: message.photo, teamId })
        console.log('sent-message-meeting', socket.id)
        // for (let m of members) {
        //     socket.to(m.id).emit('receive-message-meeting', { messageId: message.id, meetingId, teamId, senderId, content, photo: message.photo });
        // }
        socket.to(`meeting-${meetingId}`).emit('receive-message-meeting', {
            messageId: message.id, meetingId, senderId, content, photo: message.photo
        })
    })
    // socket.on("sending-signal", ({ signal, callerID, userToSignal }) => {
    //     socket.to(userToSignal).emit('joined-meeting', { signal, callerID });
    // })

    // socket.on("returning-signal", ({ signal, callerID }) => {
    //     socket.to(callerID).emit('receiving-returned-signal', { signal, userId: socket.id });
    // });

    //conversation

    socket.on('conversation-sendMessage', async ({ content, senderId, receiverId, conversationId, image }) => {
        const converId = await setConversation({ senderId, receiverId, conversationId });
        const message = await setMessage({ content, conversationId: converId, senderId, image });

        if (message) {
            socket.emit('conversation-sentMessage', { messageId: message.id, content, senderId, receiverId, conversationId: converId, photo: message.photo, createdAt: message.createdAt })
            socket.to(receiverId).emit('conversation-receiveMessage', { messageId: message.id, content, senderId, receiverId, conversationId: converId, photo: message.photo, createdAt: message.createdAt });
        }
    })

    socket.on('conversation-call', ({ conversationId, participantId }) => {
        socket.to(participantId).emit('conversation-calling', { conversationId, senderId, receiverId })
    })

    //disconnect
    socket.on('disconnect', async () => {
        // const meetingId = socketToMeeting[socket.id];
        // let room = users[meetingId];
        // if (room) {
        //     room = room.filter(id => id !== socket.id);
        //     users[meetingId] = room;
        //     socket.broadcast.to(meetingId).emit('disconnected-meeting', socket.id);
        // }
        console.log(`disconnect with meetingId: ${socket.meetingId} ${socket.id}`)
        if (socket.meetingId) {
            let { message } = await outMeeting({
                meetingId: socket.meetingId,
                userId: socket.id
            })
            if (message) {
                let members = await getActiveMemberMeeting({ meetingId: socket.meetingId });
                if (members.length === 0) {
                    console.log('all out meeting')
                    members = await updateMeetingState({ meetingId: socket.meetingId })
                    console.log(members)
                    // for (let m of members) {
                    //     socket.to(m.userId).emit('end-meeting', {
                    //         meetingId: socket.meetingId
                    //     })
                    // }
                    socket.to(`meeting-${socket.meetingId}`).emit('end-meeting', {
                        meetingId: socket.meetingId
                    })
                } else {
                    // for (let m of members) {
                    //     socket.to(m.userId).emit('user-out-meeting', { meetingId: socket.meetingId, userId: socket.id });
                    // }

                    socket.to(`meeting-${socket.meetingId}`).emit('user-out-meeting', { meetingId: socket.meetingId, userId: socket.id });
                }
            }
            delete socket.meetingId;
            socket.leave(`meeting-${socket.meetingId}`)
        }
    });
}

module.exports = socketServer;