var express = require('express');
var app     = express();
var server  = app.listen(9090);
var io      = require('socket.io').listen(server);

app.use(express.static('client'));

var count = 0;
var players = {

};

io.on('connection', function (socket) {
    players[count] = {};
    var id = count;
    count++;

    socket.on('gyro', function (data) {
        //console.log(data);
        players[id] = data;
    });

    socket.on('disconnect', function () {
        delete players[id];
    });
});

setInterval(function(){
    var synced = false;

    var leader;
    for(var i in players){
        if(!leader){
            leader = players[i];
        } else { //compare
            if(
                players[i].x > leader.x-10 &&
                players[i].y > leader.y-10 &&
                players[i].y > leader.y-10 &&
                players[i].x < leader.x+10 &&
                players[i].y < leader.y+10 &&
                players[i].y < leader.y+10
            ) {
                synced = true;
            }
        }
    }
    console.log(players);
    console.log(synced);
    io.emit('update', players);
}, 500);
