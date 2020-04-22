const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const publicDirectoryPath  = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket')

    socket.emit('welcomeMessage', 'Welcome')

    // if any user joined notify all
    socket.broadcast.emit('message', 'A new user has joined')

    // receive message from client
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if( filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', msg)
        callback()
    })
    // if disconnected a message is sent
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })

    //receive location
    socket.on('sendLocation', (coords, callback) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}` )
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on ' +port)
})
