/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Console = new Schema({
    userName: String,
    password: String,
    outletId: Number,
    token: String,
    accessType: String,
    gcmId: String
});

module.exports = mongoose.model('Console', Console);