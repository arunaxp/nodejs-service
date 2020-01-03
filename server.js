const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use('/bootstrap-css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bootstrap-js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

var users = [];

io.on('connection', function(socket){
  socket.on('login', function(message){
    users.push({
      username : message,
      id: socket.id
    });
    console.log(users);
  });
  socket.on('chat message', function(message){
    console.log(message);
    var to = message.id=='A'?'B':'A';
    for (const user of users) {
      if(user.username==to)
      {
        io.to(user.id).emit('chat message', message.message);
      }
    }
    
  });
});

http.listen(port, function(){
  console.log(`listening on : ${port}`);
});
