const express = require('express')
const app = express()
const server = require('http').createServer(app)
const cors = require('cors')
const io = require('socket.io')(server, {
  cors: '*'
})
const { v4: uuidV4 } = require('uuid')

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  // res.render('room', { roomId: req.params.room })
  return res.status(200).json({ roomId: req.params.room })
})

io.on('connection', socket => {
  console.log(socket.id)
  socket.on('join-room', (roomId, userId) => {
    console.log(`roomId ${roomId} userId ${userId}`)
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(3001, () => {
  console.log('server is running on port 3001')
})