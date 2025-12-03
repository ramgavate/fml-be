/**
 * Created by ritej on 7/29/2017.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Temp = new Schema({
    mainString: String,
    tempId: Number
});

module.exports = mongoose.model('Temp', Temp);