// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    username: String,
    socketid:String,
    is_online:Boolean,
    created_at: Date,
    updated_at: Date
  });

// userSchema.methods.dudify = function() {
//     // add some stuff to the users name
//     this.username = this.username + '-dude'; 
  
//     return this.username;
//   };

  // on every save, add the date
userSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();
  
    // change the updated_at field to current date
    this.updated_at = currentDate;
  
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
      this.created_at = currentDate;
  
    next();
  });
  // the schema is useless so far
// we need to create a model using it
var user = mongoose.model('user', userSchema);

// make this available to our users in our Node applications
module.exports = user;