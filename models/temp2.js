/**
 * Created by ritej on 7/29/2017.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Temp2 = new Schema({
    allDrinks:[],
    allCategories:[]
});

module.exports = mongoose.model('Temp2', Temp2);