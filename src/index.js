const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessages, generateLocationMessage } = require('./utills/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utills/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const publicDirectoryPath  = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New websocket')

    // receive join
    socket.on('join', ({username, room}, callback) => {
        const {error , user } = addUser({ id: socket.id, username, room})

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',  generateMessages('Admin','Welcome'))
        // if any user joined notify all
        socket.broadcast.to(user.room).emit('message', generateMessages('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        // io.to.emit = emit event in a specific room
        // socket.broadcast.to.emit = emit everyone in a specific room except himself

    })

    // receive message from client
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if( filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessages(user.username,msg))
        callback()
    })
    // if disconnected a message is sent
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessages('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    //receive location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`) )
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on ' +port)
})
