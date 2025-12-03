var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TVAppDrinkData = new Schema({
    outletId: Number,
    drinks: [{
        category: String,
        name: String,
        runningPrice: String
    }],
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('TVAppDrinkData', TVAppDrinkData);
