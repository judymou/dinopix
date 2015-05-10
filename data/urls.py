#!/usr/bin/env python
from urlparse import urlparse
from os.path import splitext, basename
import json

f = open('./megascrape/processed_all.json', 'r')
dinos = json.loads(f.read())
f.close()

new_dino_map = {}
for dino, dinoinfo in dinos.iteritems():
    new_dino_map[dino] = dinoinfo
    for imageinfo in dinoinfo['images'][:20]:
        url = imageinfo['url']
        try:
            print url
        except:
            # stupid ascii bs
            pass
