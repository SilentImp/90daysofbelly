BellyController = function() {
  mongoose  = require('mongoose');
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
        , notes: [{
          timestamp: {
            type: Date
            , default: Date.now
            , index: true 
          }
          , text: String
        }]
      });
  mongoose.connect('mongodb://localhost/bellydays:27018');
};

BellyController.prototype.saveNote    = function(req, res) {};

BellyController.prototype.getNote     = function(req, res) {};

BellyController.prototype.saveWeight  = function(req, res) {};

BellyController.prototype.getWeight   = function(req, res) {};

BellyController.prototype.uploadFile  = function(req, res) {
    var file = req.files.file;
    console.log(file.name);
    console.log(file.type);
};

module.exports = new BellyController();