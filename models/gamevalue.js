/**
 * Created by ritej on 8/23/2017.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Gamevalue = new Schema({
    seconds: String,
    maxDiscount: String,
    updated_at: Date
});

module.exports = mongoose.model('Gamevalue', Gamevalue);