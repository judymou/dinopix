var sm = require('sitemap');
var dinomap = require('./dinomap.js');

var sitemap_urls = [];
sitemap_urls.push({url: '/', changefreq: 'daily', priority: 1.0});
for (var key in dinomap) {
  sitemap_urls.push({url: key + '-dinosaur-pictures', changefreq: 'weekly', priority: 0.8});
}
console.log(sitemap_urls.length, 'in sitemap');
var sitemap = sm.createSitemap ({
  hostname: 'http://dinosaurpictures.org/',
  cacheTime: 600000,        // 600 sec - cache purge period
  urls: sitemap_urls,
});
exports.main = function(req, res) {
  sitemap.toXML( function (xml) {
      res.header('Content-Type', 'application/xml');
      res.send( xml );
  });
}
