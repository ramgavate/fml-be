var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WebCategory = new Schema({
    name: String,
    image: String,
    sub: Boolean,
    drinks: [{
        category: String,
        name: String,
        image:String,
        quantity:[{
            quantityName: String,
            runningPrice: String
        }],
        available: Boolean
    }],
    subCategory: [{
        image: String,
        drinks: [{
            category: String,
            name: String,
            image: String,
            quantity:[{
                quantityName: String,
                runningPrice: String
            }],
            available: Boolean
        }]
    }],
    visible: Boolean
});


module.exports = mongoose.model('WebCategory', WebCategory);
