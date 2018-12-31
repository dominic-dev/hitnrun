var socket = io.connect('http://192.168.3.34:3000')

const width = 800
const height = 600
const size = 30

let highscore = $('#highscore')
let topscore = $('#topscore')

let players = []

class Color {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }

    toArray() {
        return [
            this.r,
            this.g,
            this.b
        ]
    }
}

class Player {
    constructor() {
        let color = getRandomColor()
        this.r = color.r
        this.g = color.g
        this.b = color.b
        this.x = Math.random() * (width - size)
        this.y = Math.random() * (height - size)
        this.id = generateUUID()
        this.socket = ''
        this.velocity = 1
    }

    draw() {
        fill(...this.color.toArray());
        ellipse(this.x, this.y, size)
    }
}

// function parsePlayer(data) {
//     let player = Object.assign(new Player(), data)
//     player.color = Object.assign(new Color(), data.color)
//     player.socket = data.socket
//     return player;
// }

socket.emit('new_player', new Player())

socket.on('state', function(data, highscore) {
    players = data
    topscore.html('highscore: ' + (highscore-1)*5)
})

socket.on('send_speed', function(velocity) {
    highscore.html(Math.round((velocity-1) * 5) + ' km/h')
})

function getRandomColor() {
    return new Color(
        Math.random() * 256,
        Math.random() * 256,
        Math.random() * 256
    )
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function setup() {
    createCanvas(width, height);  // Size must be the first statement
    frameRate(30);
}

function draw() {
    let movement = {
        left: false,
        right: false,
        up: false,
        down: false
    }

    if (keyIsDown(LEFT_ARROW)) {
        if (! keyIsDown(RIGHT_ARROW)) {
            movement.left = true
        }
    }
    if (keyIsDown(RIGHT_ARROW)) {
        if (! keyIsDown(LEFT_ARROW)) {
            movement.right = true
        }
    }
    if (keyIsDown(UP_ARROW)) {
        if (! keyIsDown(DOWN_ARROW)) {
            movement.up = true
        }
    }
    if (keyIsDown(DOWN_ARROW)) {
        if (! keyIsDown(UP_ARROW)) {
            movement.down = true
        }
    }
    socket.emit('movement', movement);
    socket.emit('ask_speed')

    clear()
    fill(255, 255, 255)
    rect(0, 0, width-1, height-1);
    for (let id in players) {
        let player = players[id]
        fill(player.r, player.g, player.b);
        ellipse(player.x, player.y, size)
    }
}