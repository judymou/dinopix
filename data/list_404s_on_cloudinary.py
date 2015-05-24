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
        if not exists(cloudinary_url):
            print cloudinary_url
        if url not in url_to_cloudinary_urls:
            url_to_cloudinary_urls[url] = []
        url_to_cloudinary_urls[url].append(cloudinary_url)
