/* 
Create by Abhishek on 12/4/2023
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OtherTableBooking = new Schema({
    bookingId:Number,
    time:String,
    date:Date,
    name:String,
    status:String,
    outletLocation:String,
    outletName:String,
    phoneNumber: String,
    noOfPersons: String,
});
module.exports = mongoose.model('OtherTableBooking',OtherTableBooking);