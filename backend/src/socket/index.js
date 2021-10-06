const users = {};
const socketToMeeting = {};

const {getParticipantId} = require('../controllers/conversation.controller')

const socketServer = (socket) => {
    socket.on("join-meeting", meetingId => {
        if (users[meetingId]) {

            users[meetingId].push(socket.id);
        } else {
            users[meetingId] = [socket.id];
        }
        socket.join(meetingId);
        socketToMeeting[socket.id] = meetingId;
        const usersInThisRoom = users[meetingId].filter(id => id !== socket.id);
        console.log(socket.id);
        socket.emit("all-users", usersInThisRoom);



        socket.on('disconnect-meeting', () => {
            const meetingId = socketToMeeting[socket.id];
            let room = users[meetingId];
            if (room) {
                room = room.filter(id => id !== socket.id);
                users[meetingId] = room;
                socket.broadcast.to(meetingId).emit('disconnected-meeting', socket.id);
            }
        })

        socket.on('send-message-team', ({ message, userId }) => {
            socket.broadcast.to(meetingId).emit('receive-message-team', { message, userId });
        })

    });

    socket.on("sending-signal", ({ signal, callerID, userToSignal }) => {
        socket.to(userToSignal).emit('joined-meeting', { signal, callerID });
    })

    socket.on("returning-signal", ({ signal, callerID }) => {
        socket.to(callerID).emit('receiving-returned-signal', { signal, userId: socket.id });
    });

    //conversation

    socket.on('conversation-send-message', async ({ id, content, senderId, conversationId }) => {
        
        // check conversation ...
        const participantId = await getParticipantId({conversationId, userId: senderId})
        console.log('socket', participantId, content);
        socket.to(participantId).emit('conversation-receive-message', {content, senderId, conversationId})
    })

    //disconnect
    socket.on('disconnect', () => {
        const meetingId = socketToMeeting[socket.id];
        let room = users[meetingId];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[meetingId] = room;
            socket.broadcast.to(meetingId).emit('disconnected-meeting', socket.id);
        }
    });
}

module.exports = socketServer;