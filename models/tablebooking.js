/**
 * Created by ritej on 6/11/2017.
 */

var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var TableBooking = new Schema({
    bookingId: Number,
    outletId: Number,
    userId: Number,
    userGCM : String,
    userAgent : String,
    status: String,
    name: String,
    outletName: String,
    phoneNumber: String,
    date: String,
    time: String,
    noOfPeople: String,
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('TableBooking', TableBooking);
