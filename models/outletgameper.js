var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OutletGamePer = new Schema({
    outletId:Number,
    percentage:[{
        order_count:Number,
        game_count:Number,
        game_per:Number,        
        game_date:Date
    }]
});

module.exports = mongoose.model('OutletGamePer',OutletGamePer);