#!/usr/bin/env python

from bing_secrets import BING_KEY
import csv
import os
import json
import requests
import sys
from PIL import Image

f = open(sys.argv[2], 'r')
#lines = f.readlines()
#f.close()

file_type = sys.argv[1]

dinos = {}
reader = csv.reader(f)
for row in reader:
    creature_type = period = period_modifier = status = discovered = \
            discoverer = eats = ''
    regions = []
    if file_type == 'dino':
        creature_type = 'dinosaur'
        dino, period, eats = [x.strip() for x in row]
    elif file_type == 'plesio':
        creature_type = 'plesiosaur'
        dino, discoverer, discovered, status, period, region =  \
                [x.strip() for x in row]
        regions.append(region)

    out_path = 'scrape_results/%s' % dino
    if os.path.exists(out_path):
        print 'Load', dino
        f = open(out_path, 'r')
        obj = json.loads(f.read())
        f.close()
    else:
        print 'Search', dino
        r=requests.get('https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=%%27%s%%27&ImageFilters=%%27Size%%3ALarge%%27&$format=json' % dino, headers={'Authorization': 'Basic %s' % BING_KEY})

        obj = json.loads(r.text)['d']['results']
        f = open(out_path, 'w')
        f.write(json.dumps(obj, indent=2))
        f.close()

    metadino = {
        'name': dino,
        'period': period,
        'eats': eats,
        'region': regions,
        'status': status,
        'discovered': discovered,
        'discoverer': discoverer,
        'creature_type': creature_type,
        'images': []
    }
    for result in obj:
        if result['MediaUrl'].lower().find(dino.lower()) < 0:
            # Require dino name to be in image url...simple heuristic to improve
            # quality.
            continue
        metadino['images'].append({
            'width': result['Width'],
            'height': result['Height'],
            'size': result['FileSize'],
            'url': result['MediaUrl'],
            'display_url': result['DisplayUrl'],
            'source': result['SourceUrl'],
            'thumbnail': result['Thumbnail']['MediaUrl'],
        })
    if len(metadino['images']) < 1:
        # Manual intervention is required
        print 'Warning:', dino, 'does not have enough images'
        continue
        for result in obj:
            if result['MediaUrl'].lower().find(dino.lower()) < 0:
                # Require dino name to be in image url...simple heuristic to improve
                # quality.
                x = raw_input('Accept %s [y/N/cont]? ' % result['MediaUrl'])
                print x
                if x.strip() == 'cont':
                    break
                if x.strip() != 'y':
                    continue
            print 'Accepted the image'
            metadino['images'].append({
                'width': result['Width'],
                'height': result['Height'],
                'size': result['FileSize'],
                'url': result['MediaUrl'],
                'display_url': result['DisplayUrl'],
                'source': result['SourceUrl'],
                'thumbnail': result['Thumbnail']['MediaUrl'],
            })
    dinos[dino] = metadino

f = open('processed_%s' % sys.argv[2], 'w')
f.write(json.dumps(dinos, indent=2))
f.close()

