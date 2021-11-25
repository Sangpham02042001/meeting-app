require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require('cors');
const sequelize = require('./models')
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: '*',
    maxHttpBufferSize: 1e6 * 6
})

//routes
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const teamRoutes = require('./routes/team.routes')
const conversationRoutes = require('./routes/conversation.routes')
const meetingRoutes = require('./routes/meeting.routes')
const notificationRoutes = require('./routes/notification.routes')
const messageRoutes = require('./routes/message.routes')
const adminRoutes = require('./routes/admin.route')

sequelize.sync()

const socketServer = require('./socket');


const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'

app.use('/public', express.static(process.env.PUBLIC_PATH || 'public'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//routes
app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', teamRoutes)
app.use('/', conversationRoutes)
app.use('/', meetingRoutes)
app.use('/', notificationRoutes)
app.use('/', messageRoutes)

app.use('/admin', adminRoutes)

io.use((socket, next) => {
    const userID = socket.handshake.auth.userId;
    if (!userID) {
        return next(new Error("invalid userId"));
    }
    socket.userId = userID;
    next();
})

io.on('connection', socket => {
    socketServer(io, socket)

});

server.listen(PORT, HOST, () => {
    console.log(`server is running on port ${HOST}:${PORT}`)
})