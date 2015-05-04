exports.home = function(req, res) {
  res.render('home'. {});
}

exports.dinosaur = function(req, res) {
  res.render('dino'. {
    dino: req.params.dino,
  });
};
