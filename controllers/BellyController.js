var mongoose  = require('mongoose');
var moment  = require('moment');
var midnight = moment().set({'hour': 0, 'minute': 0, 'second': 0}).toString();
console.log(midnight);
var daySchema = new mongoose.Schema({
  _id: {
    type: Date
    , default: Date.now
    , index: true 
    }
  , weight: {
    type: Number
    , min: 40
    , max: 200 
    }
  , photos: Array
  , notes: [{
    id: mongoose.Schema.Types.ObjectId
    , timestamp: {
        type: Date
        , default: Date.now
        , index: true 
        }
    , text: String
    }]
  });

var days = mongoose.model('days', daySchema);
mongoose.connect('mongodb://localhost/bellydays');



BellyController = function () {};

BellyController.prototype.addNote = function (req, res) {

  mongoose.model('days').update({_id: {"$gte": midnight}},{$push: {notes: {text: req.body.note}}}, function (err, numAffected) {
    if(err !== null){
      console.log('error: ', err);
    }
    if(numAffected == 0){
      new days({"notes": [{text: req.body.note}]}).save();
    }
  });

  res.statusCode = 200;
  res.end();
};

BellyController.prototype.getNotes = function (req, res) {
  if(
    (typeof req.params == "undefined")
    || (typeof req.params.id == "undefined")
  ){
    throw new Error("Day ID undefiend.");
  }
  console.log('id: ', req.params.id);

  mongoose.model('days')
    .findOne({_id: new Date(req.params.id)})
    .select("notes")
    .exec(function (err, days) {
      if(err !== null){
        console.log('error: ', err);
      }
      if(days==null){
        res.send(new Array);
        return;
      }
      res.send(days.notes);
    });
};

BellyController.prototype.saveWeight = function (req, res) {
  mongoose.model('days').update({_id: {"$gte": midnight}},{$set: {weight: req.body.weight}}, function (err, numAffected) {
    if(err !== null){
      console.log('error: ', err);
    }
    if(numAffected == 0){
      new days({"weight": req.body.weight, _id: midnight}).save();
    }
  });

  res.statusCode = 200;
  res.end();
};

BellyController.prototype.getDays = function (req, res) {
  mongoose.model('days').find(function(err, days){
    res.send(days);
  });
};

BellyController.prototype.uploadFile = function (req, res) {
  var file = req.files.file
      , fs  = require('fs')
      , source = fs.createReadStream(file.path)
      , dest = fs.createWriteStream(__dirname + '/../photos/' + file.name)
      , ExifImage = require('exif').ExifImage;

  source.pipe(dest);
  source.on('end', function() {
    console.log('file saved');
  });
  source.on('error', function(err) {
    console.log('file was not saved', err);
  });

  mongoose.model('days').update({_id: {"$gte": midnight}},{$push: {photos: file.name}}, function (err, numAffected) {
    if(err !== null){
      console.log('error: ', err);
    }
    if(numAffected == 0){
      new days({"photos": [file.name], _id: midnight}).save();
    }
  });

  console.log(file.name);
  console.log(file.type);
  console.dir(file);
  res.send('save photo');
};

module.exports = new BellyController;
