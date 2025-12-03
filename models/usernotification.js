// Abhishek 03-06-2023
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserNotification= new Schema({
  notification_title: String,
  image_path: String,
  description: String
});

module.exports = mongoose.model('UserNotification', UserNotification);

 