#!/usr/bin/env python
import json
import os
import urllib2

f = open('processed_s3.json', 'r')
dinos = json.loads(f.read())
f.close()

c = 0
for dino, dinostuff in dinos.iteritems():
    c += 1
    print 'Processing %s (%d/%d)' % (dino, c, len(dinos))

    filepath = 'paleobiodb_list_colls_cache/%s' % dino
    if os.path.isfile(filepath):
        f = open(filepath, 'r')
        resp = f.read()
        f.close()
    else:
        resp = urllib2.urlopen('https://paleobiodb.org/data1.1/colls/list.json?base_name=%s&show=ref,loc,time' % dino).read()
        f = open(filepath, 'w')
        f.write(resp)
        f.close()

    latlngs = []
    refs = []
    for record in json.loads(resp)['records']:
        latlngs.append((record['lat'], record['lng']))
        refs.append(record['ref'])
    dinostuff['fossil_latlngs'] = latlngs
    dinostuff['refs'] = refs

f = open('processed_s3_with_latlng.json', 'w')
f.write(json.dumps(dinos, indent=2))
f.close()
