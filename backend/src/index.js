require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require('cors');
const sequelize = require('./models')
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: '*'
})

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const teamRotues = require('./routes/team.routes')
const meetingRoutes = require('./routes/meeting.routes')
const notificationRoutes = require('./routes/notification.routes')

sequelize.sync()

const users = {};
const socketToMeeting = {};

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'locahost'

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

//routes
app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', teamRotues)
app.use('/', meetingRoutes)
app.use('/', notificationRoutes)

io.on('connection', socket => {
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

        socket.on('send-message', ({ message, userId }) => {
            socket.broadcast.to(meetingId).emit('receive-message', { message, userId });
        })

    });

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

});

server.listen(PORT, HOST, () => {
    console.log(`server is running on port ${HOST}:${PORT}`)
})