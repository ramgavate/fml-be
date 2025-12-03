/**
 * Created by ritej on 4/12/2017.
 */

/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Feed = new Schema({
    personName: String,
    personImage: String,
    type: String,//regularorder , roundtime, rounddiscount, cheaper, popular
    drinkRunningPrice: String,
    drinkName: String,
    discount: String,
    quantity: Number,
    time: String,
    feedOrderId: Number,
    feedTime: String,
    feedId:Number
});

module.exports = mongoose.model('Feed', Feed);




