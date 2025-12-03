var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Event = new Schema({

    eventId: Number,
    eventName: String,
    eventDescription: String,
    eventType: String,
    eventDate: String,
    eventStartTime: String,
    eventEndTime: String,
    eventPoster: String,
    eventEntry: String,
    outlet:{
        outletId: Number,
        locality: String,
        outletImage: String
        },
    termsAndConditions: String,
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Event', Event);
