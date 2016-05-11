var Bot = require('messenger-bot');
var dinomap = require('../routes/dinomap.js');
var dinoroute = require('../routes/dinos.js');

function setup(app) {
  var bot = new Bot({
    token: process.env.DINOPIX_FB_PAGE_TOKEN,
    verify: process.env.DINOPIX_FB_VERIFY_TOKEN,
    app_secret: process.env.DINOPIX_FB_APP_SECRET,
  });

  bot.on('error', function(err) {
    console.error(err);
  });

  bot.on('message', function(payload, reply) {
    var text = payload.message.text;

    interpretAndReply(text, reply);
  });

  app.get('/api/fb/webhook', function(req, res) {
    bot._verify(req, res);
  });

  app.post('/api/fb/webhook', function(req, res) {
    bot._handleMessage(req.body);
    res.end(JSON.stringify({status: 'ok'}));
  });
}

function interpretAndReply(text, reply) {
  var dinoresult = tryDinoSearch(text);
  if (matches(text, ['random', 'next', 'another', 'more'])) {
    sendRandomDino(reply);
  } else if(dinoresult) {
    doDinoReply(dinoresult[0], dinoresult[1], reply);
  } else if (matches(text, ['hello', 'hi', 'hey'])) {
    doReply("Hi! Try typing 'random' or enter the name of a dinosaur.", reply);
  } else if (matches(text, ['thank you', 'thanks', 'thx'])) {
    doReply("No problem <3", reply);
  } else if (matches(text, ['how are you', 'whats up', 'what\'s up'])) {
    doReply("Still sad about dinosaurs going extinct :(", reply);
  } else {
    doReply("Sorry, I don't understand.  Try 'random' or enter the name of a dinosaur.", reply);
  }
}

function tryDinoSearch(text) {
  // TODO(ian): This can be constant lookup if we store keys case-insensitively.
  var dm = dinomap.get();
  var keys = Object.keys(dm);

  var matchKey = null;
  keys.some(function(k) {
    if (text.toLowerCase().indexOf(k.toLowerCase()) > -1) {
      matchKey = k;
      return true;
    }
  });

  if (matchKey) {
    return [matchKey[0].toUpperCase() + matchKey.slice(1), dm[matchKey]];
  }
  return false;
}

function matches(text, possibilities) {
  var matched = false;
  text = text.toLowerCase();
  return possibilities.some(function(s) {
    if (text.indexOf(s.toLowerCase()) > -1) {
      return true;
    }
  });
}

function sendRandomDino(reply) {
  var dm = dinomap.get();
  var keys = Object.keys(dm);
  var dinoname = keys[keys.length * Math.random() << 0];
  var match = dm[dinoname];

  doDinoReply(dinoname, match, reply);
}

function doReply(text, replyFn) {
  replyFn({
    text: text,
  }, function(err) {
    if (err) console.error(err);
  });
}

function doDinoReply(name, dinomatch, replyFn) {
  var replyObj = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: name,
            image_url: dinoroute.picsForDinosaur(dinomatch)[0].url,
            subtitle: dinomatch.eats + ' from the ' + dinomatch.period +
                ' period, residing in ' +
                dinoroute.getRegionsForDino(dinomatch).join(', '),
            buttons: [
              {
                type: 'web_url',
                url: 'http://dinosaurpictures.org/' + name + '-pictures',
                title: 'Learn more',
              },
            ],
          },
        ],
      },
    },
  };

  console.log(JSON.stringify(replyObj));

  replyFn(replyObj, function(err) {
    if (err) console.error(err);
  });
}

module.exports = {
  setup: setup,
}
