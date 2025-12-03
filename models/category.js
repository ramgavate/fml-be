/**
 * Created by ritej on 1/12/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Category = new Schema({
    id: Number,
    name: String,
    sequence: Number,
    created_at: Date,
    updated_at: Date,
    visible: Boolean,
    __v:Number
});

module.exports = mongoose.model('Category', Category);
