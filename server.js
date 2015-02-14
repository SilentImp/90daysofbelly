var express           = require('express')
    , app             = express()
    , hookshot        = require('hookshot')
    , port            = process.env.PORT || 8080
    , multiparty      = require('connect-multiparty')
    , BellyController = require('./controllers/BellyController.js')
    , options         = {
      dotfiles: 'ignore'
      , extensions: ['xml']
      , index: false
    };


app.use(express.static('public'));

// Origin
// app.get('/crossdomain.xml', function(req, res){
//   res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
//   res.setHeader('Access-Control-Allow-Origin', 'http://silentimp.github.io');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   res.send('crossdomain.xml');
// });

// Notes
app.get('/note/', BellyController.getNote);
app.post('/note/', BellyController.saveNote);

// Weight
app.get('/weight/',   BellyController.getWeight);
app.post('/weight/',  BellyController.saveWeight);

// Photo
app.put('/photo/', multiparty(), BellyController.uploadFile);

// Server
app.listen(port);
console.log('Magic happens on http://178.79.181.157:' + port);

// Auto efresh script and restart
hookshot('refs/heads/server', 'git pull && pm2 restart server.js').listen(9001);