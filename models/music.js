/**
 * Created by ritej on 6/8/2017.
 */


/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

var Music = new Schema({
    musicId: Number,
    musicGenre: String,
    day: String,
    musicPoster: String,
    songs: [{
        artist: String,
        songName: String,
        songPoster: String,
        album: String
    }]
});

module.exports = mongoose.model('Music', Music);
