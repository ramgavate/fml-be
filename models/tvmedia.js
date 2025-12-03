const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TvMediaSchema = new Schema({
  outlet_id: {
    type: String,
    required: true,
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  media_path: {
    type: String,
    required: true,
  },
});

const TvMedia = mongoose.model('TvMedia', TvMediaSchema);

module.exports = TvMedia;
