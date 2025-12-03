// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const tvVideoSchema = new Schema({
//   outlet_id: {
//     type: String,
//     required: true,
//   },
//   video: [
//     {
//       video_path: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
// });

// const TvVideo = mongoose.model('TvVideo', tvVideoSchema);

// module.exports = TvVideo;


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tvVideoSchema = new Schema({
  outlet_id: {
    type: String,
    required: true,
  },
  videos: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        auto: true,
      },
      video_path: {
        type: String,
        required: true,
      },
      is_image_video: {
        type: Boolean,
        required: false,
      },
      number_of_sec: {
        type: Number,
        required: false,
      },
    },
  ],
});

const TvVideo = mongoose.model('TvVideo', tvVideoSchema);

module.exports = TvVideo;
