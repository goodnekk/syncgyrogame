var express = require('express');
var app     = express();
var server  = app.listen(9090);
var io      = require('socket.io').listen(server);

app.use(express.static('client'));


io.on('connection', function (socket) {
    socket.on('gyro', function (data) {
        console.log(data);
    });
});
