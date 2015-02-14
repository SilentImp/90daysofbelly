var express           = require('express')
    , app             = express()
    , router          = express.Router()
    , hookshot        = require('hookshot')
    , port            = process.env.PORT || 8080
    , multiparty      = require('connect-multiparty')
    , BellyController = require('./controllers/BellyController.js')
    , options         = {
      dotfiles: 'ignore'
      , extensions: ['xml']
      , index: false
    };


// Serving static
router.use(express.static('public', options));
router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Origin',  'http://silentimp.github.io');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Notes
router.get('/note/', BellyController.getNote);
router.post('/note/', BellyController.saveNote);

// Weight
router.get('/weight/',   BellyController.getWeight);
router.post('/weight/',  BellyController.saveWeight);

// Photo
router.put('/photo/', multiparty(), BellyController.uploadFile);

// Server
app.listen(port);
console.log('Magic happens on http://178.79.181.157:' + port);

// Auto efresh script and restart
hookshot('refs/heads/server', 'git pull && pm2 restart server.js').listen(9001);