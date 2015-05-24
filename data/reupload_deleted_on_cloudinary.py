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

cloudinary_url_to_url = {}
cloudinary_url_to_image_objs = {}
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
        if cloudinary_url in cloudinary_url_to_url:
            print 'Gasp - repeat url for', cloudinary_url
        if cloudinary_url not in cloudinary_url_to_image_objs:
            cloudinary_url_to_image_objs[cloudinary_url] = []
        cloudinary_url_to_url[cloudinary_url] = url
        cloudinary_url_to_image_objs[cloudinary_url].append(image)

f = open('deleted_pics', 'r')
deleted_cloudinary_urls = [x.strip() for x in f.readlines()]
f.close()

print 'recovering', len(deleted_cloudinary_urls)
for cloudinary_url in deleted_cloudinary_urls:
    if not cloudinary_url in cloudinary_url_to_url:
        print 'Couldnt find match for deleted cloudinaryu url', cloudinary_url
        continue
    name = cloudinary_url[cloudinary_url.rfind('/')+1:]
    name = name[:name.rfind('.')].strip()
    url = cloudinary_url_to_url[cloudinary_url]
    try:
        new_cloudinary_url = cloudinary.uploader.upload(url, public_id=name)['secure_url']
    except:
        print 'upload failed for', url
        for image_obj in cloudinary_url_to_image_objs[cloudinary_url]:
            image_obj['cloudinary_url'] = None
        continue
    print 'uploaded', new_cloudinary_url
    for image_obj in cloudinary_url_to_image_objs[cloudinary_url]:
        image_obj['cloudinary_url'] = new_cloudinary_url

f = open('processed_all_corrected.json', 'w')
f.write(json.dumps(dinos, indent=2))
f.close()
