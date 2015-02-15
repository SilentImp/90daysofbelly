BellyController = function() {
  this.mongoose  = require('mongoose');
  this.noteSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId
    , timestamp: {
        type: Date
        , default: Date.now
        , index: true 
      }
      , text: String
    });

  this.daySchema = new mongoose.Schema({
    id: this.mongoose.Schema.Types.ObjectId
    , timestamp: {
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
    , notes: [this.noteSchema]
  });
  this.day = this.mongoose.model('days', this.daySchema);
  this.mongoose.connect('mongodb://localhost/bellydays:27018');

};

BellyController.prototype.getToday   = function() {
  this.day.find().
};

BellyController.prototype.saveNote    = function(req, res) {
  res.send('save note');
};

BellyController.prototype.getNote     = function(req, res) {

};

BellyController.prototype.saveWeight  = function(req, res) {
  if(
    (typeof req.body == "undefined")
    || (typeof req.body.weight == "undefined")
  ){
    throw new Error("Weight variable undefiend.");
  }


};

BellyController.prototype.getWeight   = function(req, res) {
  this.mongoose.model('days').find(function(err, days){
    res.send(days);
  });
};

BellyController.prototype.uploadFile  = function(req, res) {
  var file = req.files.file
      , fs  = require('fs')
      , source = fs.createReadStream(file.path)
      , dest = fs.createWriteStream(__dirname + '/../photos/' + file.name);

  source.pipe(dest);
  source.on('end', function() {
    console.log('file saved');
  });
  source.on('error', function(err) {
    console.log('file was not saved', err);
  });

  console.log(file.name);
  console.log(file.type);
  console.dir(file);
  res.send('save photo');
};

module.exports = new BellyController();
