var fs = require('fs');
var path = require('path');

module.exports = exports = (function() {
  var text = fs.readFileSync(path.resolve(__dirname, '../reported.txt')) + '';
  lines = text.match(/[^\r\n]+/g);
  var ret = {};
  lines.forEach(function(line) {
    var dino = line.slice(0, line.indexOf(':')).trim();
    var url = line.slice(line.indexOf(':') + 1).trim();
    // For now, just care about url.
    ret[url] = true;
  });
  return ret;
})();
