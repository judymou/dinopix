require('dotenv').config();

var express = require('express')
  , dinos = require('./routes/dinos.js')
  , sitemap = require('./routes/sitemap.js')
  , fb_bot = require('./fb_bot/fb_bot.js')
  , http = require('http')
  , path = require('path')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4100);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', dinos.home);
app.get('/:dino-dinosaur-pictures', function(req, res) {
  res.redirect(301, '/' + req.params.dino + '-pictures');
});
app.get('/:dino-pictures', dinos.dinosaur);
app.get('/:filter-dinosaurs', dinos.filter);
app.get('/api', dinos.apiInfo);
app.get('/api/dinosaur/random', dinos.jsonRandomDinosaur);
app.get('/api/dinosaur/:dino', dinos.jsonDinosaur);
app.get('/api/category/:filter', dinos.jsonFilter);
app.get('/api/category/all', dinos.jsonFilter);
app.get('/random', dinos.random);
app.get('/json', dinos.json);
app.get('/report', dinos.report);
app.get('/featurevote', dinos.featurevote);
app.get('/upvote', dinos.upvote);
app.get('/downvote', dinos.downvote);

// someday - dinosaurs by era!

app.get('/sitemap.xml', sitemap.main);

// Set up facebook bot.
fb_bot.setup(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
