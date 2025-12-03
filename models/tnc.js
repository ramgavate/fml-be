var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Tnc = new Schema({
    tncId: Number,
    termsAndConditions: String,
    privacyPolicy: String
});

module.exports = mongoose.model('Tnc', Tnc);