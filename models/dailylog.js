/**
 * Created by ritej on 11/9/2017.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Dailylog = new Schema({
    logDate: String,
    loggings:[{
        log: String,
        logTime: String
    }]
});

module.exports = mongoose.model('Dailylog', Dailylog);
