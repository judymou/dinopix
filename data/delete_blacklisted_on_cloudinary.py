#!/usr/bin/env python
import requests
import secrets
import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils
from urlparse import urlparse
from os.path import splitext, basename
import urllib
import json
import sys

cloudinary.config(
    cloud_name = 'dinopics',
    api_key = secrets.API_KEY,
    api_secret = secrets.API_SECRET,
)

#print cloudinary.utils.cloudinary_url("Lythronax_lythronax_by_vitor_silva-d74iz1n_43.jpg")

def exists(path):
    r = requests.head(path)
    return r.status_code == requests.codes.ok

url_to_cloudinary_urls = {}
f = open('processed_all_cloudinary.json', 'r')
dinos = json.loads(f.read())
f.close()

for dino, dinostuff in dinos.iteritems():
    for image in dinostuff['images']:
        url = urllib.unquote(image['url'])
        cloudinary_url = image['cloudinary_url']
        if not cloudinary_url:
            #print dino, 'has null cloudinary url'
            continue
        #if not exists(cloudinary_url):
        #    print cloudinary_url
        if url not in url_to_cloudinary_urls:
            url_to_cloudinary_urls[url] = []
        url_to_cloudinary_urls[url].append(cloudinary_url)

#sys.exit(1)


blacklisted = []
f = open('../web/reported.txt', 'r')
blacklisted = f.readlines()
f.close()

def url_to_name(dino, url):
    disassembled = urlparse(url)
    filename, _ = splitext(basename(disassembled.path))
    return '%s_%s_%d' % (dino, filename, c)

names = []
for line in blacklisted:
    idx = line.find(':')
    url = line[idx+1:].strip()
    dino = line[:idx]
    #print dino, url
    #name = url_to_name(dino, url)
    #print name

    if url not in url_to_cloudinary_urls:
        #print '!!! could not find url for', dino
        continue
    for cloudinary_url in url_to_cloudinary_urls[url]:
        #print '   -> found cloudinary url', cloudinary_url
        name = cloudinary_url[cloudinary_url.rfind('/')+1:]
        name = name[:name.rfind('.')].strip()
        #print cloudinary_url
        #print '    -> ', name
        names.append(name)
        if len(names) == 100:
            print cloudinary.api.delete_resources(names)
            names = []
    #sys.exit(1)
print cloudinary.api.delete_resources(names)
