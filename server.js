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
app.use(express.static('public', options))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
      res.setHeader('Access-Control-Allow-Origin',  'http://silentimp.github.io');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });


// Get days list
app.get('/day/', BellyController.getDays);

// Save weight
app.post('/day/', BellyController.saveWeight);

// Add photo
app.put('/photo/', multiparty(), BellyController.uploadFile);

// Get notes list
app.get('/note/:id/', BellyController.getNotes);

// Add note
app.post('/note/', BellyController.addNote);

// Server
app.listen(port);
console.log('Server started on http://178.79.181.157:' + port+'/');

// Auto efresh script and restart
hookshot('refs/heads/server', 'git pull && pm2 restart server.js').listen(9001);


