const express = require('express')
const app = express()
const distance = 5
const width = 800
const height = 600
const size = 30
const acceleration = 1.01

let highscore = 0

const settings = require('./settings')
console.log(settings)

let players = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

// Routes
app.get('/', (req, res) => {
    res.render('index', {players: players})
})
const server = app.listen(3000, '192.168.3.34')

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    console.log('Player connected')

    // New player
    socket.on('new_player', (player) => {
        player.socket = socket.id
        players[socket.id] = player
        console.log('new player')
    })

    // Disconnect
    socket.on('disconnect', function () {
        console.log('Player disconected');
        delete players[socket.id]
    })

    socket.on('ask_speed', function() {
        let player = players[socket.id]
        if (player) {
            socket.emit('send_speed', player.velocity)
        }
    })

    socket.on('movement', function(data) {



        let player = players[socket.id]
        if (! player) {
            return
        }
        let moved = false
        if (data.left) {
            if (player.x > size) {
                moved = true
                player.x -= distance * player.velocity
            }
        }
        if (data.up) {
            if (player.y > size) {
                player.y -= distance * player.velocity
                moved = true
            }
        }
        if (data.right) {
            if (player.x < width - size) {
                player.x += distance * player.velocity
                moved = true
            }
        }
        if (data.down) {
            if (player.y < height - size) {
                player.y += distance * player.velocity
                moved = true
            }
        }


        for (let id in players) {
            if (socket.id != id) {
                let opponent = players[id]
                console.log('checking opponent')
                if (Math.abs(player.x - opponent.x) < size &&
                    Math.abs(player.y - opponent.y) < size) {
                    console.log('hit')
                    moved = false
                    player.velocity = 0.5
                }
            }
        }

        if (moved) {
            player.velocity *= acceleration
        } else {
            if (player.velocity > highscore) {
                highscore = player.velocity
            }
            player.velocity = 1
        }
    });
})

setInterval(function() {
    io.sockets.emit('state', players, highscore);
}, 1000/60);