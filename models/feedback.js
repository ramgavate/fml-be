/**
 * Created by ritej on 6/11/2017.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Feedback = new Schema({
    feedbackId: Number,
    rating: Number,
    comment: String,
    userId: Number,
    userName: String,
    profilePic: String,
    phoneNumber: String,
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Feedback', Feedback);