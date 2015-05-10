var fs = require('fs');
var path = require('path');

module.exports = exports = (function() {
  var text = fs.readFileSync(path.resolve(__dirname, '../upvoted.txt')) + '';
  lines = text.match(/[^\r\n]+/g);
  var ret = {};
  lines.forEach(function(line) {
    var dino = line.slice(0, line.indexOf(':'));
    var url = line.slice(line.indexOf(':') + 1);
    // For now, just care about url.
    // TODO dedup and add add score!
    ret[url] = true;
  });
  return ret;
})();
