const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessages, generateLocationMessage } = require('./utills/messages')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const publicDirectoryPath  = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket')

    socket.emit('message',  generateMessages('Welcome'))

    // if any user joined notify all
    socket.broadcast.emit('message', generateMessages('A new user has joined'))

    // receive message from client
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if( filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessages(msg))
        callback()
    })
    // if disconnected a message is sent
    socket.on('disconnect', () => {
        io.emit('message', generateMessages('A user has left'))
    })

    //receive location
    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`) )
        callback()

    })

    //socket.emit('locationMessage', )
})

server.listen(port, () => {
    console.log('Server is up on ' +port)
})
