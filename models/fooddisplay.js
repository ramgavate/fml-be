/**
 * Created by ritej on 4/12/2017.
 */

/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Fooddisplay = new Schema({
    foodImage : String,
    foodImageId : Number
});

module.exports = mongoose.model('Fooddisplay', Fooddisplay);




