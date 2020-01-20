const express = require('express');
const app = express();
var bodyParser = require("body-parser");
const uservice = require('./services/user-service');
const rChatService = require('./services/randomchat-service');

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.use('/bootstrap-css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bootstrap-js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var myLogger = function (req, res, next) {
  console.log('LOGGED')
  next()
}

app.use(myLogger)

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/signout', async (req, res) =>{
  let issignout = await uservice.deleteuser(req.body.username.toLowerCase());
  console.log(issignout);
  users = await uservice.getallusers(req.body.username.toLowerCase());
  res.send(true);
});

//get random chat
app.post('/getrandom', async (req, res)=>{
  users = await uservice.getallusers();
  var currentUser = users.find(u=>u._id==req.body.userid);
  var onlineUsers = users.filter(x=>x._id!=req.body.userid && x.is_online==true);
  var randUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
  var randChat = await rChatService.initiateRandomChat(currentUser,randUser);
  
  if(randChat!=undefined){
      res.send({_id:randChat._id,users:[currentUser,randUser]});
    }
    else{
      res.send({_id:null,users:[]});
  }
});

//check unser name already exsist
app.post('/isnameexist', async (req, res) =>{
  var isexist = await uservice.isusernameexist(req.body.username.toLowerCase());
  res.send(isexist);
});

//get user
app.post('/user', async (req, res) =>{
  var u = await uservice.getuser(req.body.username.toLowerCase());
  res.send(u);
});

var users = [];

io.on('connection', function(socket){

  socket.on('login', async (un) => {
      await uservice.login(un.toLowerCase(),socket.id);
      users = await uservice.getallusers();
      var u = await uservice.getuser(un.toLowerCase());
      console.log(u[0])
      io.to(u[0].socketid).emit('login', u[0]);
  });

  socket.on('chat_message', function(message){
    console.log(message);
    for (const user of users) {
      console.log(user)
      io.to(user.socketid).emit('chat_message', message);
    }
  });

  socket.on('close_connection', async (user)=>{
  //   console.log(user);
  //   socket.disconnect(user);
  //   console.log('close_connection');
      var rand = await rChatService.getRandomChatBy('sam');
      console.log('---------------');
      rand.users.forEach(usr => {
        if(usr.username!='sam'){
         console.log(usr);
         console.log('---------------');
          uservice.getUserById(usr._id).then((u)=>{
            console.log(u);
            console.log('---------------');
            io.to(u.socketid).emit('disconnect', u);
          });
        }
      });
      
  });

  socket.on('chat-reconnect', async (un)=>{
    console.log('socket re connected');
    console.log(un);
    if(un!=null){
      await uservice.updateusersocketid(un.toLowerCase(),socket.id);
      await uservice.updateUserStatus(socket.id,true);
    }
  });

  socket.on('disconnect', async ()=> {
    console.log('disconnect');
    var user = await uservice.getUserBySocketId(socket.id);
    user = await uservice.updateUserStatus(socket.id,false);

    var rand = await rChatService.getRandomChatBy(user.username);
    console.log('---------------');
    console.log(rand);
    rand.users.forEach(usr => {
      if(usr.username!=user.username){
       console.log(usr);
       console.log('---------------');
        uservice.getUserById(usr._id).then((u)=>{
          console.log(u[0].socketid);
          console.log('---------------');
          io.to(u[0].socketid).emit('user_offline', user);
        });
      }
    });

  });

});

http.listen(port, function(){
  console.log(`listening on : ${port}`);
});
