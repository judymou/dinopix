var fs = require('fs');
var stable = require('stable');
var dinomap = require('./dinomap.js');
var useragents = require('./useragents.js');
var featured = require('./featured.js');
var reported_map = require('./reported.js');
var util = require('../util.js');

util.installObjectExtend();

var reportedCache = {};

exports.home = function(req, res) {
  var dinoNamesList = [];
  for (var key in dinomap.get()) {
    dinoNamesList.push(key);
  }
  var featuredDinos = shuffle(featured.get());
  res.render('home', {
    totalCount: dinoNamesList.length,
    dinos: dinoNamesList,
    dinosShortList: shuffle(dinoNamesList.slice(0)).slice(0, 20),
    dinosShortListIsComplete: dinoNamesList.length <= 20,
    // TODO same dino can appear twice!
    featuredFirstRow: featuredDinos.slice(0, 4),
    featuredSecondRow: featuredDinos.slice(4, 8),
    showFeatured: true,
  });
};

function getDinoNamesForCategory(filter) {
  switch(filter) {
    case 'triassic':
      return dinomap.getTriassicDinoNames();
    case 'jurassic':
      return dinomap.getJurassicDinoNames();
    case 'cretaceous':
      return dinomap.getCretaceousDinoNames();
    case 'north-america':
      return dinomap.getNorthAmericaDinoNames();
    case 'south-america':
      return dinomap.getSouthAmericaDinoNames();
    case 'europe':
      return dinomap.getEuropeDinoNames();
    case 'africa':
      return dinomap.getAfricaDinoNames();
    case 'madagascar':
      return dinomap.getMadagascarDinoNames();
    case 'asia':
      return dinomap.getAsiaDinoNames();
    case 'india':
      return dinomap.getIndiaDinoNames();
    case 'australia':
      return dinomap.getAustraliaDinoNames();
    case 'antarctica':
      return dinomap.getAntarcticaDinoNames();
    case 'all':
      return dinomap.get();
  };
  return {};
}

exports.jsonFilter = function(req, res) {
  res.send(
    getDinoNamesForCategory(req.params.filter.trim()).extend({success:true}));
}

exports.filter = function(req, res) {
  // TODO choose featured and popular based on who's in this filter!
  var filter = req.params.filter.trim();
  var dinoNamesList = getDinoNamesForCategory(filter);
  // Put all the names matching this filter into a map, then have the lazy
  // filter function filter featured dinos by what's in the map.
  // TODO getting lazy here.  This is inefficient.
  var dinoNamesMap = {};
  dinoNamesList.forEach(function(name) {
    dinoNamesMap[name] = true;
  });
  var featuredDinos = shuffle(featured.lazyFilter(filter, function(dino) {
    return dino['name'] in dinoNamesMap;
  }));
  res.render('home', {
    totalCount: dinoNamesList.length,
    showFeatured: true,
    featuredFirstRow: featuredDinos.slice(0, 4),
    featuredSecondRow: featuredDinos.length > 20 ?
      featuredDinos.slice(4, 8) : null,
    filterPrefix: (function() {
      var splits = filter.split('-');
      return splits.map(function(split) {
        return split[0].toUpperCase() + split.slice(1)
      }).join(' ');
    })(),
    dinos: dinoNamesList,
    dinosShortList: (function() {
      if (dinoNamesList.length <= 20) {
        return dinoNamesList;
      }
      return shuffle(dinoNamesList.slice(0)).slice(0, 20)
    })(),
    dinosShortListIsComplete: dinoNamesList.length <= 20,
  });
};

function getRegionsForDino(match) {
  return match['region'].map(function(region) {
    switch(region) {
      case 'na':
        return 'North America';
      case 'sa':
        return 'South America';
      default:
        return region[0].toUpperCase() + region.slice(1);
    }
  });
}

exports.jsonDinosaur = function(req, res) {
  var dino = req.params.dino.trim().toLowerCase();
  dino = dino[0].toUpperCase() + dino.slice(1);
  var match = dinomap.get()[dino];
  if (!match) {
    res.status(404);
    res.send({success: false, message: "Dinosaur not found"});
    return;
  }

  res.send({
    dino: dino,
    period: match['period'],
    eats: match['eats'],
    regions: getRegionsForDino(match),
    pics: picsForDinosaur(match),
  });
}

exports.dinosaur = function(req, res) {
  var dino = req.params.dino.trim();
  var match = dinomap.get()[dino];
  if (!match) {
    return null;
  }

  res.render('dino', {
    dino: dino,
    period: match['period'],
    eats: match['eats'],
    regions: getRegionsForDino(match).join(', '),
    pics: picsForDinosaur(match),
    prevDino: match['prev'],
    nextDino: match['next'],
    count: match['count'],
    adminReview: !!req.query['review'],
    isCrawler: useragents.isCrawler(req),
  });
};

exports.random = function(req, res) {
  var dinoNames = [];
  for (var key in dinomap.get()) {
    dinoNames.push(key);
  }

  var name = dinoNames[Math.floor(Math.random() * dinoNames.length)];
  res.redirect('/' + name + '-pictures');
};

exports.json = function(req, res) {
  res.send(JSON.stringify(dinomap.get()));
};

exports.report = function(req, res) {
  var url = decodeURIComponent(req.query.url);
  var dino = decodeURIComponent(req.query.dino);
  console.log('got report for', url);
  fs.appendFile('reported.txt', dino + ':' + url + '\n', function (err) {
    res.send('ok');
  });
};

exports.featurevote = function(req, res) {
  var url = decodeURIComponent(req.query.url);
  var dino = decodeURIComponent(req.query.dino);
  console.log('got featurevote for', url);
  fs.appendFile('featurevoted.txt', dino + ':' + url + '\n', function (err) {
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

exports.downvote = function(req, res) {
  var url = decodeURIComponent(req.query.url);
  var dino = decodeURIComponent(req.query.dino);
  console.log('got downvote for', url);
  fs.appendFile('downvoted.txt', dino + ':' + url + '\n', function (err) {
    res.send('ok');
  });
};

// Returns pics for a given dinosaur from dinomap.  Does all the ranking and
// ensures bad images aren't returned.
function picsForDinosaur(match) {
  var pics = [];
  var count = 0;
  match['images'].forEach(function(picitem) {
    if (++count >= 20) {
      return false;
    }
    if (decodeURIComponent(picitem['url']) in reported_map) {
      return true;
    }
    var cloudinary_url_resized = picitem['cloudinary_url'] ?
      picitem['cloudinary_url'].replace('/upload/', '/upload/c_limit,w_960/') :
      null;
    pics.push({
      //url: picitem['url'],
      voting_url: picitem['url'],
      url: cloudinary_url_resized || picitem['url'],
      clickthrough_url: picitem['cloudinary_url'] || picitem['url'],
      thumbnail: picitem['thumbnail'],
      source: picitem['source'],
      source_display: picitem['display_url'],
    });
  });

  return stable(pics, function(a, b) {
    if (featured.isFeaturedUrl(a['voting_url'])) {
      return -1;
    }
    return 1;
  });
}

function shuffle(o) {
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
