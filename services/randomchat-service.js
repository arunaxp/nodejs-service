const mongoose = require('mongoose');
var randomchat = require('../models/randomchat');
const config = require('../nconfig');

var options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

createNewRandomChat = async (currentUser,randomUser) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                var rChat = new randomchat({
                    users: [
                        {_id:currentUser._id,username:currentUser.username},
                        {_id:randomUser._id,username:randomUser.username},
                    ],
                    history: 'history',
                    is_active:true
                });

                rChat.save(function(err,data) {
                    if (err) throw err;
                    resolve(data);
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};

initiateRandomChat = async (currentUser,randomUser) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED');
                randomchat.find({'users.username': { $all: [currentUser.username,randomUser.username] }}, function(err, usr) {
                    if (err) throw err;
                    if(usr.length>0){
                        console.log(usr[0]);
                        usr[0].is_active = true;
                        resolve(usr[0]);
                    }
                    else{
                        var chat = createNewRandomChat(currentUser,randomUser);
                        resolve(chat[0]);
                    }
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};


getRandomChatBy = async (username) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED 1');
                randomchat.find({'users.username': username }, function(err, usr) {
                    if (err) throw err;
                    resolve(usr[0]);
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};


module.exports={
    initiateRandomChat:initiateRandomChat,
    createNewRandomChat:createNewRandomChat,
    getRandomChatBy:getRandomChatBy
}