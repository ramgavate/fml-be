/**
 * Created by ritej on 4/12/2017.
 */

/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Game = new Schema({
    gameId: Number,
    gameStatus: String,
    tableNumber: String,
    orderId: Number,
    status: String,
    isRepeat:Boolean,
    outletId: Number,
    userId: Number,
    userName: String,
    drinks:[{
        userPrice: String,
        numberofdrinks: Number,
        category: String,
        drinkType: String,
        drinkId: Number,
        name: String,
        basePrice: String,
        capPrice: String,
        runningPrice: String,
        available: Boolean,
        demandRate: Number,
        itemCode: Number,
        demandLevel: Number,
        priceIncrementPerUnit: Number,
        status: Boolean,
        regularPrice: Number,
        priceVariable: Boolean,
        skucode:String
    }],
    orderDate: String,
    orderTime: String,
    startTime: String,
    endTime: String,
    created_at: Date,
    updated_at: Date,
    billId: Number
});

module.exports = mongoose.model('Game', Game);




