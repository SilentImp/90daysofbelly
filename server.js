var express           = require('express')
    , app             = express()
    // , Git             = require('git-wrapper2')
    // , git             = new Git()
    // , gith            = require('gith').create(9001)
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

// Auto Deploy
// gith({
//   repo: 'SilentImp/90daysofbelly'
// }).on( 'all', function( payload ) {
//   console.log( 'Post-receive happened!' );
//   git.pull('git@github.com:SilentImp/90daysofbelly.git', 'server');
// });

hookshot()
.on('refs/heads/server', 'git pull')
.listen(9001)