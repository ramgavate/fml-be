/**
 * Created by ritej on 2/13/2017.
 */

var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Pos = new Schema({
    userName: String,
    password: String,
    outletId: Number,
    token: String
});

module.exports = mongoose.model('Pos', Pos);