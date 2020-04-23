const users = []

// addUser
const addUser = ( { id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user
    const existingUser = users.find( (user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store user
    const user = { id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id 
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find( (user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 2,
//     username: 'ash',
//     room: 'my'
// })
// addUser({
//     id: 22,
//     username: 'asha',
//     room: 'my'
// })
// addUser({
//     id: 32,
//     username: 'ashaa',
//     room: 'myRoom'
// })

// const user = getUser(221)
// console.log(user)

// const list = getUsersInRoom('my')
// console.log(list)

// // console.log(users)

// // const removedUser = removeUser(2)
// // console.log(removedUser)
// // console.log(users)
// // const res = addUser({
// //     id: 23,
// //     username: 'ash',
// //     room: 'my'
// // })

// // console.log(res)