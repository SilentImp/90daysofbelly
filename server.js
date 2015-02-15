var express           = require('express')
    , app             = express()
    , hookshot        = require('hookshot')
    , port            = process.env.PORT || 8080
    , multiparty      = require('connect-multiparty')
    , BellyController = require('./controllers/BellyController.js')
    , bodyParser      = require('body-parser')
    , options         = {
      dotfiles: 'ignore'
      , extensions: ['xml']
      , index: false
    };


// Serving static
app.use(express.static('public', options));

// Adding headers, so we can upload files
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Origin',  'http://silentimp.github.io');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  bodyParser.json();
  bodyParser.urlencoded({
    extended: true
  });
  next();
});

// Notes
app.get('/note/', BellyController.getNote);
app.post('/note/', BellyController.saveNote);

// Weight
app.get('/weight/', multiparty(), function(req, res){
  console.dir(req);
});
app.post('/weight/',  BellyController.saveWeight);

// Photo
app.put('/photo/', multiparty(), BellyController.uploadFile);

// Server
app.listen(port);
console.log('Magic happens on http://178.79.181.157:' + port);

// Auto efresh script and restart
hookshot('refs/heads/server', 'git pull && pm2 restart server.js').listen(9001);