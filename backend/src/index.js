require('dotenv').config();
const express = require("express");
const http = require("http");
const sequelize = require('./models')
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: '*'
})
const userRoutes = require('./routes/user.routes')

const users = {};
sequelize.sync()

const socketToRoom = {};
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'locahost'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//routes
app.use('/', userRoutes)

io.on('connection', socket => {
    socket.on("join room", roomID => {
        if (users[roomID]) {

            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socket.join(roomID);
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        console.log(socket.id);
        socket.emit("all users", usersInThisRoom);

        socket.on('disconnect', () => {
            const roomID = socketToRoom[socket.id];
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== socket.id);
                users[roomID] = room;
                console.log('emittttttttttt', socket.id)
                socket.broadcast.to(roomID).emit('user disconnected', socket.id);
            }
        });

    });

    socket.on("sending signal", ({ signal, callerID, userToSignal }) => {
        io.to(userToSignal).emit('user joined', { signal, callerID });
    });

    socket.on("returning signal", ({ signal, callerID }) => {
        io.to(callerID).emit('receiving returned signal', { signal, userId: socket.id });
    });
});

server.listen(PORT, HOST, () => {
    console.log(`server is running on port ${HOST}:${PORT}`)
})