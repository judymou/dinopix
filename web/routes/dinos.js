var dinomap = require('./dinomap.js');

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
    pics: match,
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
