var dinomap = require('./dinomap.js');

exports.home = function(req, res) {
  res.render('home', {});
}

exports.dinosaur = function(req, res) {
  var dino = req.params.dino.trim();
  var match = dinomap[dino];
  if (!match) {
    res.send('not found');
    return;
  }

  res.render('dino', {
    dino: dino,
    pics: match,
  });
};
