/**
 * Created by ritej on 10/21/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Offeravail = new Schema({
    loginId: String,
    userId: String,
    name: String,
    status: String,
    profilePic: String,
    email: String,
    created_at: Date,
    updated_at: Date,
    availDate: String,
    availTime: String,
    offerUsedDate: String,
    offerUsedTime: String

});

module.exports = mongoose.model('Offeravail', Offeravail);
