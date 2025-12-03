/**
 * Created by ritej on 3/18/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Foodcategory = new Schema({
    id: Number,
    name: String,
    sequence: Number,
    created_at: Date,
    updated_at: Date,
    visible: Boolean
});

module.exports = mongoose.model('Foodcategory', Foodcategory);
