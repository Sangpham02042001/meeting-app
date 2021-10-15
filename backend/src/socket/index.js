const users = {};
const socketToMeeting = {};

const { getMembers, sendMessage } = require('../controllers/team.controller')

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
        console.log(image)
        let members = await getMembers({ teamId });
        members = members.filter(m => m.id !== senderId);
        const message = await sendMessage({ teamId, senderId, content, image })
        console.log(message.content)
        socket.emit('sent-message-team', { messageId: message.id, content, teamId, senderId, photo: message.photo })
        
        for (let m of members) {
            socket.to(m.id).emit('receive-message-team', { messageId: message.id, teamId, senderId, content, photo: message.photo });
        }
    })

    //meeting
    socket.on("sending-signal", ({ signal, callerID, userToSignal }) => {
        socket.to(userToSignal).emit('joined-meeting', { signal, callerID });
    })

    socket.on("returning-signal", ({ signal, callerID }) => {
        socket.to(callerID).emit('receiving-returned-signal', { signal, userId: socket.id });
    });

    //conversation

    socket.on('conversation-sendMessage', async ({ content, senderId, receiverId, conversationId, image }) => {
        const converId = await setConversation({ senderId, receiverId, conversationId });

        const message = await setMessage({ content, conversationId: converId, senderId, image });

        if (converId !== conversationId) {
            socket.emit('set-conversation', { nConversationId: converId, oConversationId: conversationId });
        }
    
        if (message) {
            socket.emit('conversation-sentMessage',  { messageId: message.id, content, senderId, conversationId: converId, photo: message.photo })
            socket.to(receiverId).emit('conversation-receiveMessage', { messageId: message.id, content, senderId, conversationId: converId, photo: message.photo });
        }
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