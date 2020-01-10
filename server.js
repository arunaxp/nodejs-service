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
    console.log(users.find(x=>x.username==message));
    users = users.filter(function(value, index, arr){
      return value.username!=message;
    });
    console.log(JSON.stringify(users));
    users.push({
      username : message,
      id: socket.id
    });
    console.log('-------');
    console.log(users);
    console.log('-------');
  });
  socket.on('chat message', function(message){
    console.log(message);
    var to = message.id=='Aruna'?'Sam':'Aruna';
    for (const user of users) {
      console.log(user.username,to)

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
