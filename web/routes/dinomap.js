var fs = require('fs');
var path = require('path');

module.exports = exports = (function() {
  var map = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../../data/megascrape/processed_all.json')));
  return map;
})();
