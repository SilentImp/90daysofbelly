var express           = require('express')
    , app             = express()
    , hookshot        = require('hookshot')
    , port            = process.env.PORT || 8080
    , multiparty      = require('connect-multiparty')
    , BellyController = require('./controllers/BellyController.js');

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

// Auto deploy
hookshot('refs/heads/server', 'git pull').listen(9001);