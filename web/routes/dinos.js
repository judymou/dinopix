var fs = require('fs');
var dinomap = require('./dinomap.js');

var reportedCache = {};

exports.home = function(req, res) {
  var dinoNames = [];
  for (var key in dinomap) {
    dinoNames.push(key);
  }
  res.render('home', {
    dinos: dinoNames,
    popular: ['Tyrannosaurus', 'Allosaurus', 'Ankylosaurus', 'Triceratops',
      'Brachiosaurus', 'Apatosaurus', 'Pachycephalosaurus'],
  });
};

exports.dinosaur = function(req, res) {
  var dino = req.params.dino.trim();
  var match = dinomap[dino];
  if (!match) {
    res.send('not found');
    return;
  }

  res.render('dino', {
    dino: dino,
    prevDino: match['prev'],
    nextDino: match['next'],
    period: match['period'],
    eats: match['eats'],
    regions: (function() {
      return match['region'].map(function(region) {
        switch(region) {
          case 'na':
            return 'North America';
          case 'sa':
            return 'South America';
          default:
            return region[0].toUpperCase() + region.slice(1);
        }
      }).join(', ');
    })(),
    pics: (function() {
      var pics = [];
      match['images'].forEach(function(picitem) {
        pics.push({
          //url: picitem['cloudinary'] || picitem['original'],
          url: req.query.review == '1' ? picitem['thumbnail'] : picitem['url'],
          source: picitem['source'],
          source_display: picitem['display_url'],
        });
      });
      return pics.slice(0, 20);
    })(),
  });
};

exports.random = function(req, res) {
  var dinoNames = [];
  for (var key in dinomap) {
    dinoNames.push(key);
  }

  var name = dinoNames[Math.floor(Math.random() * dinoNames.length)];
  res.redirect('/' + name + '-dinosaur-pictures');
};

exports.json = function(req, res) {
  res.send(JSON.stringify(dinomap));
};

exports.report = function(req, res) {
  var url = decodeURIComponent(req.query.url);
  var dino = decodeURIComponent(req.query.dino);
  console.log('got report for', url);
  fs.appendFile('reported.txt', dino + ':' + url + '\n', function (err) {
    res.send('ok');
  });
};
