var fs = require('fs');
var dinomap = require('./dinomap.js');
var featured = require('./featured.js');
var reported_map = require('./reported.js');

var reportedCache = {};

exports.home = function(req, res) {
  var dinoNames = [];
  for (var key in dinomap) {
    dinoNames.push(key);
  }
  featured = shuffle(featured);
  res.render('home', {
    dinos: dinoNames,
    popular: ['Tyrannosaurus', 'Allosaurus', 'Ankylosaurus', 'Triceratops',
      'Brachiosaurus', 'Apatosaurus', 'Pachycephalosaurus'],
    featuredFirstRow: featured.slice(0, 4),
    featuredSecondRow: featured.slice(4, 8),
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
    count: match['count'],
    total: dinomap['_total'],
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
    pics: picsForDinosaur(match),
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

exports.upvote = function(req, res) {
  var url = decodeURIComponent(req.query.url);
  var dino = decodeURIComponent(req.query.dino);
  console.log('got upvote for', url);
  fs.appendFile('upvoted.txt', dino + ':' + url + '\n', function (err) {
    res.send('ok');
  });
};

// Returns pics for a given dinosaur from dinomap.  Does all the ranking and
// ensures bad images aren't returned.
function picsForDinosaur(match, useThumbnails) {
  var pics = [];
  match['images'].forEach(function(picitem) {
    if (picitem['url'] in reported_map) {
      return true;
    }
    pics.push({
      //url: picitem['cloudinary'] || picitem['original'],
      url: useThumbnails ? picitem['thumbnail'] : picitem['url'],
      source: picitem['source'],
      source_display: picitem['display_url'],
    });
  });
  return pics.slice(0, 20);
}


function shuffle(o) {
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
