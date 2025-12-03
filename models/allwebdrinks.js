
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var WebAllDrink = new Schema({

        category: String,
        name: String,
        image: String,
        quantity:[{
            quantityName: String,
            runningPrice: String
        }],
        available: Boolean

});

module.exports = mongoose.model('WebAllDrink', WebAllDrink);
