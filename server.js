var express           = require('express')
    , app             = express()
    , hookshot        = require('hookshot')
    , port            = process.env.PORT || 8080
    , multiparty      = require('connect-multiparty')
    , BellyController = require('./controllers/BellyController.js')
    , bodyParser      = require('body-parser')
    , cookieParser    = require('cookie-parser')
    , morgan          = require('morgan')
    , passport        = require('passport')
    , flash           = require('connect-flash')
    , session         = require('express-session')
    , TwitterStrategy = require('passport-twitter').Strategy
    , options         = {
      dotfiles: 'ignore'
      , extensions: ['html', 'css', 'js', 'png', 'jpg', 'svg']
      , index: false
    }
    , image_options   = {
      dotfiles: 'ignore'
      , extensions: ['jpg', 'png']
      , index: false
    };


// Serving static
app.use(express.static('public', options))
    .use(express.static('photos', image_options))
    .use(morgan('dev'))
    .use(cookieParser())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
      res.setHeader('Access-Control-Allow-Origin', 'http://bellydays.diet/');
      // res.setHeader('Access-Control-Allow-Origin', null);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      next();
    })
    .use(session({
      secret: 'ilovescotchscotchyscotchscotch',
      resave: true,
      saveUninitialized: true
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use(flash());

// Login
app.get('/login/', passport.authenticate('twitter'));

// Get days list
app.get('/day/', BellyController.getDays);

// Save weight
app.post('/day/', BellyController.saveWeight);

// Add photo
app.put('/photo/', multiparty(), BellyController.uploadFile);

// Add note
app.post('/note/', BellyController.addNote);

// Server
app.listen(port);
console.log('Server started on http://178.79.181.157:' + port+'/');

// Auto refresh script and restart
// hookshot('refs/heads/server', 'git pull && pm2 restart server.js').listen(9001);
