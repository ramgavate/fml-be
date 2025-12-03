/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Order = new Schema({
    tableNumber: String,
    orderId: Number,
    status: String,
    orderType: String,
    orderDate: String,
    orderTime: String,
    confirmTime: String,
    placedTime: String,
    cancelTime: String,
    gameId: Number,
    outletId: Number,
    userId: Number,
    name: String,
    adminId : Number,
    drinks:[{
        userPrice: String,
        numberofdrinks: Number,
        drinkType: String,
        category: String,
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
        remark: String,
        regularPrice: Number,
        priceVariable: Boolean,
        skucode:String
    }],
    foods:[{
        foodId: Number,
        foodType: String,
        name: String,
        basePrice: String,
        available: Boolean,
        numberoffoods: Number,
        itemCode: Number,
        remark: String,
        delivered:Boolean,
        skucode:String
    }],
    created_at: Date,
    updated_at: Date,
    syncStatus: Number
});

module.exports = mongoose.model('Order', Order);
