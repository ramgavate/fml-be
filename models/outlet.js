/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Outlet = new Schema({
    outletId: Number,
    name: String,
    status: String,
    locality: String,
    outletImage: String,
    address: String,
    phno: String,
    lat: String,
    lon: String,
    startTime: String,
    endTime: String,
    strikeOutDrinkPercentage: Number,
    placeOfferIds: [],
    placeEventIds: [],
    drinks:[{
        drinkId: Number,
        drinkType: String,
        categoryCode: Number,
        category: String,
        name: String,
        itemImage: String,
        recommended: Boolean,
        description: String,
        basePrice: String,
        capPrice: String,
        runningPrice: String,
        available: Boolean,
        itemCode: Number,
        demandRate: Number,
        demandLevel: Number,
        priceIncrementPerUnit: Number,
        status: Boolean,
        regularPrice: Number,
        priceVariable: Boolean,
        skucode:String,
        isStrikeOut: Boolean, //abhishek
        offerName: String, //abhishek
        isOffer: Boolean, //abhishek
        specialTab: Boolean, //abhishek
        tabName: String, //abhishek
    }],
    foods:[{
        foodId: Number,
        foodType: String,
        name: String,
        itemImage: String,
        recommended: Boolean,
        description: String,
        basePrice: String,
        available: Boolean,
        itemCode: Number,
        skucode:String,
        isStrikeOut: Boolean,
        strikeOutPrice: String, //abhishek
        }],
    tables:[{
        tableNumber: String,
        tableId: Number,
        capacity: String,
        assigned: Boolean,
        assignedUserId:Number,
        assignedAdmin: Number,
        status: String,
        created_at: Date,
        updated_at: Date
    }],
    created_at: Date,
    updated_at: Date,
    total_billings:Number,
    oldpos:Number
});

module.exports = mongoose.model('Outlet', Outlet);