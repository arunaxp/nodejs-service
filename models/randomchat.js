var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user = require('../models/user');

var userSchema = new Schema({_id:String,username:String});
var randomChatSchema = new Schema({
    users: [userSchema],
    history:String,
    created_at: Date,
    updated_at: Date,
    is_active:Boolean
  });


  randomChatSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();
  
    // change the updated_at field to current date
    this.updated_at = currentDate;
  
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;
  
    next();
  });

  
var randomchat = mongoose.model('randomchat', randomChatSchema);

// make this available to our users in our Node applications
module.exports = randomchat;