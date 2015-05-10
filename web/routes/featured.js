var fs = require('fs');
var path = require('path');
var dinomap = require('./dinomap.js');

var text = fs.readFileSync(path.resolve(__dirname, '../featurevoted.txt')) + '';
lines = text.match(/[^\r\n]+/g);
var featuredDinos = [];
var seenUrls = {};
lines.forEach(function(line) {
  var dino = line.slice(0, line.indexOf(':'));
  var url = line.slice(line.indexOf(':') + 1);
  if (url in seenUrls) {
    return true;
  }
  featuredDinos.push({
    name: dino,
    img: dinomap.getThumbFor(url) || url,
  });
  seenUrls[url] = true;
});

var filterCache = {};

module.exports = exports = {
  get: function() {
    return featuredDinos;
  },
  isFeaturedUrl: function(url) {
    return url in seenUrls;
  },
  lazyFilter: function(filterId, fn) {
    if (!filterCache[filterId]) {
      filterCache[filterId] = featuredDinos.filter(function(dino) {
        return fn(dino);
      });
    }
    return filterCache[filterId];
  },
}
