var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Offer = new Schema({
    offerId: Number,
    offerName: String,
    offerDetail: String,
    offerType: String,
    offerStartDate: String,
    offerEndDate: String,
    offerStartTime: String,
    offerEndTime: String,
    offerImage: String,
    //canAvail: Boolean,
    //inMyOffers: Boolean,
    offerAlcoholType: [],
    outlet:{
        outletId: Number,
        locality: String,
        outletImage: String,
        phno: String
    },
    termsAndConditions: String,
    pushImage: String,
    offerDays: [],
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Offer', Offer);