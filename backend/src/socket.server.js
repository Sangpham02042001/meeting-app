const users = {};
const socketToMeeting = {};

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

    socket.on('join-team', ({ teamId }) => {
        socket.join(`team ${teamId}`)
    })

    socket.emit('out-team', ({ teamId }) => {
        socket.leave(`team ${teamId}`)
    })

    socket.on("sending-signal", ({ signal, callerID, userToSignal }) => {
        socket.to(userToSignal).emit('joined-meeting', { signal, callerID });
    })

    socket.on("returning-signal", ({ signal, callerID }) => {
        socket.to(callerID).emit('receiving-returned-signal', { signal, userId: socket.id });
    });



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