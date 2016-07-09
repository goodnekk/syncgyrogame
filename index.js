var express = require('express');
var app     = express();
var server  = app.listen(9090);
var io      = require('socket.io').listen(server);

app.use(express.static('client'));


//0: waiting
//1: countdown
//2: round
//3: reset time

var timer = 0;
var gamestate = 0;
var waitingroom = {};

var count = 0;
var players = {};

var leader;

io.on('connection', function (socket) {
    waitingroom[count] = {
        ready: false,
        socket: socket,
        pos: {}
    };

    var id = count;
    count++;

    socket.on('gyro', function (data) {
        if(gamestate === 1){
            players[id].pos = data;
        }
    });

    socket.on('ready', function (data) {
        if(gamestate === 0){
            waitingroom[id].ready = data;
        }
    });

    socket.on('disconnect', function () {
        delete waitingroom[id];
    });
});

setInterval(function(){
    //waiting
    if(gamestate === 0){
        var playercount = 0;
        var ready = true;
        for(var i in waitingroom){
            playercount++;
            if(!waitingroom[i].ready){
                ready = false;
            }
        }
        if(ready && (playercount > 1)) {
            gamestate = 1;
            timer = 0;
            players = waitingroom;

            io.emit('go');
            console.log("go");

        }
    }

    //countdown
    if(gamestate === 1){
        console.log("countdown");
        timer ++;
        if(timer === 27 ){
            gamestate = 2;
            timer = 0;
        }
    }

    //pick random leader
    if(gamestate === 2){
        console.log("leader");
        //select random leader
        gamestate = 3;
        var keys = [];
        for (var prop in players) {
            if (players.hasOwnProperty(prop)) {
                keys.push(prop);
            }
        }

        leader = players[keys[Math.floor(Math.random()*keys.length)]];
        leader.socket.emit("leader");
        leader.socket.broadcast.emit("follower");
    }

    //
    if(gamestate === 3){
        console.log("playing");
        timer ++;
        if(timer === 10){
            timer = 0;
            gamestate = 4;
            for(var j in players){
                if(
                    players[j].pos.x > leader.pos.x-5 &&
                    players[j].pos.y > leader.pos.y-5 &&
                    players[j].pos.y > leader.pos.y-5 &&
                    players[j].pos.x < leader.pos.x+5 &&
                    players[j].pos.y < leader.pos.y+5 &&
                    players[j].pos.y < leader.pos.y+5
                ) {
                    players[j].socket.emit("great");
                } else {
                    players[j].socket.emit("fail");
                }
            }
        }
    }

    if(gamestate === 4){
        console.log("results");
        timer ++;
        if(timer === 6){
            timer = 0;
            gamestate = 2;
        }
    }

}, 500);
