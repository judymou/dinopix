#!/usr/bin/env python
import json
import urllib2

f = open('processed_s3.json', 'r')
dinos = json.loads(f.read())
f.close()

c = 0
for dino, dinostuff in dinos.iteritems():
    c += 1
    print 'Processing %s (%d/%d)' % (dino, c, len(dinos))
    resp = urllib2.urlopen('https://paleobiodb.org/data1.1/colls/list.json?base_name=%s&show=ref,loc,time' % dino).read()
    f = open('paleobiodb_list_colls_cache/%s' % dino, 'w')
    f.write(resp)
    f.close()

    latlngs = []
    for record in json.loads(resp)['records']:
        latlngs.append((record['lat'], record['lng']))
    dinostuff['fossil_latlngs'] = latlngs

f = open('processed_s3_with_latlng.json', 'w')
f.write(json.dumps(dinos, indent=2))
f.close()
