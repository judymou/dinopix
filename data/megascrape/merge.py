#!/usr/bin/env python

import json
import sys

args = sys.argv[1:]
print args

alldinos = {}

for path in args:
    region = path.split('_')[1].split('.')[0].strip()
    if region == 'all':
        continue
    print region

    f = open(path, 'r')
    dinos = json.loads(f.read())
    f.close()
    for key, val in dinos.iteritems():
        if key not in alldinos:
            alldinos[key] = val
            alldinos[key]['region'] = [region]
        else:
            alldinos[key]['region'].append(region)

f = open('processed_all.json', 'w')
f.write(json.dumps(alldinos, indent=2))
f.close()
