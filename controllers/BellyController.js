var mongoose  = require('mongoose')
    , moment  = require('moment')
    , time = moment().set({'hour': 0, 'minute': 0, 'second': 0})
    , unixtime = time.unix()
    , midnight = time.toString()
    , nextDay = moment().set({'hour': 0, 'minute': 0, 'second': 1}).toString()
    , mkdirp = require('mkdirp')
    , daySchema = new mongoose.Schema({
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
      , photos: [{
        id: mongoose.Schema.Types.ObjectId
        , url: String
        }]
      , notes: [{
        id: mongoose.Schema.Types.ObjectId
        , timestamp: {
            type: Date
            , default: Date.now
            , index: true 
            }
        , text: String
        }]
      })
    , days = mongoose.model('days', daySchema);

mongoose.connect('mongodb://localhost/bellydays');

BellyController = function () {};

BellyController.prototype.addNote = function (req, res) {

  mongoose.model('days').update({_id: {"$gte": midnight, "$lt": nextDay}}, {$push: {notes: {text: req.body.note}}}, function (err, numAffected) {
    if(err !== null){
      console.log('error: ', err);
    }
    if(numAffected == 0){
      new days({_id: midnight, "notes": [{text: req.body.note}]}).save();
    }
  });

  res.statusCode = 200;
  res.end();
};

BellyController.prototype.saveWeight = function (req, res) {
  mongoose.model('days').update({_id: {"$gte": midnight, "$lt": nextDay}}, {$set: {weight: req.body.weight}}, function (err, numAffected) {
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
  var query = mongoose.model('days').find().sort({_id: 1}).toConstructor();
  query().exec(function(err, days){
    if(err !== null){
      console.log('error: ', err);
    }
    res.send(days);
    res.statusCode = 200;
    res.end();
  });
  
};

BellyController.prototype.uploadFile = function (req, res) {
  var file = req.files.file
      , path = __dirname + '/../photos/' + unixtime + '/'
      , filename = file.name
      , fs  = require('fs')
      , source = fs.createReadStream(file.path)
      , dest
      , ExifImage = require('exif').ExifImage
      , i = 0;

  mkdirp(path);

  while(true){
    if(fs.existsSync(path+filename)){
      i++;
      filename = i + '_' + file.name;
    }else{
      break;
    }
  }

  dest = fs.createWriteStream(path+filename);

  source.pipe(dest);
  source.on('end', function() {
    console.log('file saved');
  });
  source.on('error', function(err) {
    console.log('file was not saved', err);
  });

  mongoose.model('days').update({_id: {"$gte": midnight}}, {$push: {photos: {url: filename}}}, function (err, numAffected) {
    if(err !== null){
      console.log('error: ', err);
    }
    if(numAffected == 0){
      new days({_id: midnight, "photos": [{url: filename}]}).save();
    }
  });

  console.log(file.name);
  console.log(file.type);
  // console.dir(file);
  res.send('save photo');
};

module.exports = new BellyController;
