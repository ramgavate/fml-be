const mongoose = require('mongoose');

const tvbannerSchema = new mongoose.Schema({
  outlet_id: Number,
  banner: [
    {
      image_video_path: String,
      number_of_sec: Number,
      is_image_video: String
    }
  ]
});

const TvBanner = mongoose.model('TvBanner', tvbannerSchema);

module.exports = TvBanner;
