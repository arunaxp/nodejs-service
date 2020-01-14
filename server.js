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
  socket.on('login', function(un){

    users = users.filter(function(value, index, arr){
      return value.username!=un;
    });
    
    users.push({
      username : un,
      socketid: socket.id
    });

    console.log('-------');
    console.log(users);
    console.log('-------');
  });

socket.on('chat_message', function(message){
  console.log(message);
    //var to = message.id.toLowerCase()=='aruna'?'sam':'aruna';
    for (const user of users) {
      // if(user.username.toLowerCase()==to)
      // {
        console.log(user)
        io.to(user.socketid).emit('chat_message', message);
      // }
    }
  });
});

http.listen(port, function(){
  console.log(`listening on : ${port}`);
});
