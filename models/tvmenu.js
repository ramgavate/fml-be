/**
 * Created by ritej on 10/9/2017.
 */

var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Tvmenu = new Schema({
    userName: String,
    password: String,
    outletId: Number
});

module.exports = mongoose.model('Tvmenu', Tvmenu);