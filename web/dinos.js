var express = require('express')
  , dinos = require('./routes/dinos.js')
  , sitemap = require('./routes/sitemap.js')
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
app.get('/:dino-dinosaur-pictures', dinos.dinosaur);
app.get('/random', dinos.random);
app.get('/json', dinos.json);

// someday - dinosaurs by era!

app.get('/sitemap.xml', sitemap.main);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
