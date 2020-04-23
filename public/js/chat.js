const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
const $locationButton = document.querySelector('#send-location')

//templates 
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

//options
const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.on('message', (message) => {
    console.log(message)
    //rendering html to the browser
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('locationMessage', (msg) => {
    console.log(msg)

    const html = Mustache.render(locationTemplate,{
        url: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm a')

    })

    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable
    $messageFormButton.setAttribute('disabled', 'disabled')



    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        // enable 
        $messageFormButton.removeAttribute('disabled')

        // remove message from form after sending
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if( error) {
            return console.log(error)
        }
        console.log('Delivered')
    })

})


$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported')
    }
    //disable
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            //enable
            $locationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', { 
    username, room
},(error) => {
    if( error){
        alert(error)
        location.href = '/'
    }
})