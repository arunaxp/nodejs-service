const mongoose = require('mongoose');
var user = require('../models/user');
const config = require('../nconfig');

var options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

module.exports.getallusers = async function(msg) {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED');
                user.find({}, function(err, _users) {
                    if (err) throw err;
                    resolve(_users);
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve([]);
            });
    });
};

module.exports.deleteuser = async function(usr) {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED');
                user.findOneAndRemove({
                    username: usr
                }, function(err) {
                    if (err) throw err;

                    console.log('User deleted!');
                    resolve(true);
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};



module.exports.isusernameexist = async (username) => {
    await mongoose.connect(config.db.host, options);

    return new Promise((resolve, reject) => {

        user.find({
            username: username
        }, function(err, usr) {
            if (err) throw err;

            if (usr.length > 0)
                resolve(true);
            else
                resolve(false);
        });
    });
};

module.exports.getuser = async (username) => {
    await mongoose.connect(config.db.host, options);

    return new Promise((resolve, reject) => {
        console.log(username);
        user.find({username: username }, function(err, usr) {
            if (err) throw err;

            resolve(usr);
        });
    });
};

module.exports.getUserBySocketId = async (id) => {
    await mongoose.connect(config.db.host, options);

    return new Promise((resolve, reject) => {
        user.find({socketid: id }, function(err, usr) {
            if (err) throw err;
            resolve(usr[0]);
        });
    });
};


module.exports.getUserById = async (id) => {
    await mongoose.connect(config.db.host, options);

    return new Promise((resolve, reject) => {
        user.find({_id: id }, function(err, usr) {
            if (err) throw err;
            resolve(usr);
        });
    });
};


module.exports.updateUserStatus = async (id,status) => {
    await mongoose.connect(config.db.host, options);

    return new Promise((resolve, reject) => {
        user.find({socketid: id }, function(err, usr) {
            if (err) throw err;
            if(usr[0]!=undefined){
                usr[0].is_online = status;

                //update user
                usr[0].save(function(err) {
                if (err) throw err;
                    console.log('User successfully updated!');
                    resolve(usr[0]);
                });
            }
        });
    });
};

module.exports.login = async (un, socketid) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED');

                var newUser = new user({
                    username: un.toLowerCase(),
                    socketid: socketid,
                    is_online:true,
                });

                newUser.save(function(err) {
                    if (err) throw err;
                    resolve(true);
                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};


module.exports.updateusersocketid = async (un, socketid) => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.db.host, options)
            .then(() => {
                console.log('DB CONNECTED');
                user.find({username: un }, function(err, usr) {
                    if (err) throw err;

                    usr[0].socketid = socketid;

                    //update user
                    usr[0].save(function(err) {
                        if (err) throw err;
                        console.log('User successfully updated!');
                        resolve(true);
                    });

                });
            })
            .catch((error) => {
                console.log('info', 'error connecting to db: ' + error);
                resolve(false);
            });
    });
};