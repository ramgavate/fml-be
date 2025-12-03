/**
 * Created by ritej on 8/21/2016.
 */

var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Bill = new Schema({
    billId: Number,
    tableNumber: String,
    syncStatus: Number,
    billDate: String,
    billTime: String,
    totalBill: Number,
    status: String,
    orderIds: [{
        orderId: Number
    }],
    outletId: Number,
    requestedBy: Number,
    userIds: [{
        userId: Number
    }],
    adminId: Number,
    generatedBy: String,
    gst: Number,
    serviceChargeOnFood: Number,
    serviceChargeOnDrink: Number,
    vatOnDrink : Number,
    cancelTime: String,
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Bill', Bill);
