/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Config = new Schema({
    userDiscountPerLevel : Number,
    userNumberOfLevel : Number,
    userTimePerLevel : Number,
    currencyType : String,
    flickerPercent : Number,
    noOfDrinksForFlickerDiscount : Number,
    loyaltyDiscountPercent : Number,
    noOfOrdersForLoyaltyDiscount : Number,
    updated_at : Date,
    created_at : Date
});

module.exports = mongoose.model('Config', Config);
