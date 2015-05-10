var fs = require('fs');
var path = require('path');

var map = JSON.parse(fs.readFileSync(
  //path.resolve(__dirname, '../../data/megascrape/processed_all.json')));
  path.resolve(__dirname, '../../data/processed_all_cloudinary.json')));

// Sort the map by dino name.
var list = [];
for (var key in map) {
  list.push(map[key]);
}
list.sort(function(a, b) {
  return a.name.localeCompare(b.name);
});
var sortedDinoMap = {};
var imageUrlToThumbnail = {};

// Eras
var triassicList = [];
var jurassicList = [];
var cretaceousList = [];

// Geographies
var northAmericaList = [];
var southAmericaList = [];
var europeList = [];
var africaList = [];
var madagascarList = [];
var asiaList = [];
var indiaList = [];
var australiaList = [];
var antarcticaList = [];

var prevName = null;
var count = 0;
list.forEach(function(item) {
  count++;
  var dinoName = item['name'];
  sortedDinoMap[dinoName] = item;

  // Record image url map
  item['images'].forEach(function(imageInfo) {
    imageUrlToThumbnail[imageInfo['url']] = imageInfo['thumbnail'];
  });

  // Period
  var period = item['period'].toLowerCase();
  if (period.indexOf('triassic') > -1) {
    triassicList.push(dinoName);
  }
  if (period.indexOf('jurassic') > -1) {
    jurassicList.push(dinoName);
  }
  if (period.indexOf('cretaceous') > -1) {
    cretaceousList.push(dinoName);
  }

  // Geography
  item['region'].forEach(function(region) {
    switch(region) {
      case 'na':
        northAmericaList.push(dinoName);
        break;
      case 'sa':
        southAmericaList.push(dinoName);
        break;
      case 'europe':
        europeList.push(dinoName);
        break;
      case 'africa':
        africaList.push(dinoName);
        break;
      case 'madagascar':
        madagascarList.push(dinoName);
        break;
      case 'asia':
        asiaList.push(dinoName);
        break;
      case 'india':
        indiaList.push(dinoName);
        break;
      case 'australia':
        australiaList.push(dinoName);
        break;
      case 'antarctica':
        antarcticaList.push(dinoName);
        break;
      default:
        console.warn('What region is', region, '???');
    }
  });

  // Previous and next
  if (prevName) {
    sortedDinoMap[dinoName]['prev'] = prevName;
    sortedDinoMap[dinoName]['count'] = count;
    sortedDinoMap[prevName]['next'] = dinoName;
  }
  prevName = item.name;
});

module.exports = exports = {
  get: function() {
    return sortedDinoMap;
  },
  getThumbFor: function(url) {
    return imageUrlToThumbnail[url];
  },
  getTriassicDinoNames: function() {
    return triassicList;
  },
  getJurassicDinoNames: function() {
    return jurassicList;
  },
  getCretaceousDinoNames: function() {
    return cretaceousList;
  },
  getNorthAmericaDinoNames: function() {
    return northAmericaList;
  },
  getSouthAmericaDinoNames: function() {
    return southAmericaList;
  },
  getEuropeDinoNames: function() {
    return europeList;
  },
  getAfricaDinoNames: function() {
    return africaList;
  },
  getMadagascarDinoNames: function() {
    return madagascarList;
  },
  getAsiaDinoNames: function() {
    return asiaList;
  },
  getIndiaDinoNames: function() {
    return indiaList;
  },
  getAustraliaDinoNames: function() {
    return australiaList;
  },
  getAntarcticaDinoNames: function() {
    return antarcticaList;
  }
}
