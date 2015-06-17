var fs = require('fs');
var path = require('path');

module.exports = exports = (function() {
  var text = fs.readFileSync(path.resolve(__dirname, '../downvoted.txt')) + '';
  lines = text.match(/[^\r\n]+/g);
  var ret = {};
  if (!lines) {
    return ret;
  }
  lines.forEach(function(line) {
    var dino = line.slice(0, line.indexOf(':'));
    var url = line.slice(line.indexOf(':') + 1);
    // For now, just care about url.
    ret[url] = ret[url] + 1 || 1;
  });
  return ret;
})();
