var sm = require('sitemap');
var dinomap = require('./dinomap.js');

var sitemap_urls = [];
sitemap_urls.push({url: '', changefreq: 'daily', priority: 1.0});
sitemap_urls.push({url: '/triassic-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/jurassic-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/cretaceous-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/north-america-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/south-america-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/europe-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/africa-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/madagascar-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/asia-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/india-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/australia-dinosaurs', changefreq: 'weekly', priority: 0.9});
sitemap_urls.push({url: '/antarctica-dinosaurs', changefreq: 'weekly', priority: 0.9});
for (var key in dinomap.get()) {
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
