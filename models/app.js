var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var app = new Schema({
    appName: String,
    Android_Version: String,
    IOS_Version: String,
});
module.exports = mongoose.model('app', app);