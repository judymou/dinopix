var fs = require('fs');
var path = require('path');

module.exports = exports = (function() {
  var map = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../../data/megascrape/processed_all.json')));

  // Sort the map by dino name.
  var list = [];
  for (var key in map) {
    list.push(map[key]);
  }
  list.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  var sorted = {};
  var prevName = null;
  var count = 0;
  list.forEach(function(item) {
    count++;
    sorted[item.name] = item;
    if (prevName) {
      sorted[item.name]['prev'] = prevName;
      sorted[item.name]['count'] = count;
      sorted[prevName]['next'] = item.name;
    }
    prevName = item.name;
  });
  return sorted;
})();
