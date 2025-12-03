/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var User = new Schema({
    token: String,
    userId: Number,
    userName: String,
    loginId: String,
    name: String,
    email: String,
    profilePic: String,
    userAgent: String,
    gcmId: String,
    phoneNumber: String,
    gender: String,
    noOfOrders: Number,
    totalSpent: Number,
    gameId: Number,
    lastGameId: Number,//0 when billed and >0 when repeating order
    currentBill: String,
    currentTableNumber: String,
    created_at: Date,
    updated_at: Date,
    inprofile: Boolean,
    orders:[],
    myBookings:[],
    freeDrink: Boolean,
    otp: String,
    birthdate:Date,
    isDeleted:Number,
    userSavingOnGame:Number,
    lifeTimeSpent:Number,
    isProcessed: {
        type: Boolean,
        default: false
      },
    lastOrderDate:Date,
    numberOfVisits:Number,
    userOutlet:Number,
    userOutletName:String,

});

module.exports = mongoose.model('User', User);