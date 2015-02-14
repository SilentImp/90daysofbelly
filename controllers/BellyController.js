BellyController = function() {
  mongoose  = require('mongoose');
  
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
        id: mongoose.Schema.Types.ObjectId
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
  mongoose.connect('mongodb://localhost/bellydays:27018');
};

BellyController.prototype.saveNote    = function(req, res) {
  res.send('save note');
};

BellyController.prototype.getNote     = function(req, res) {
  res.send('get notes list refreshed');
};

BellyController.prototype.saveWeight  = function(req, res) {
  res.send('save weight');
};

BellyController.prototype.getWeight   = function(req, res) {
  res.send('get weight');
};

BellyController.prototype.uploadFile  = function(req, res) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  var file = req.files.file;
  console.log(file.name);
  console.log(file.type);
  res.send('save photo');
};

module.exports = new BellyController();