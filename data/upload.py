#!/usr/bin/env python
import secrets
import cloudinary
import cloudinary.uploader
import cloudinary.api
from urlparse import urlparse
from os.path import splitext, basename
import json

cloudinary.config(
    cloud_name = 'dinopics',
    api_key = secrets.API_KEY,
    api_secret = secrets.API_SECRET,
)

cloudinary.api.delete_all_resources()

f = open('./megascrape/processed_all.json', 'r')
dinos = json.loads(f.read())
f.close()

# TODO this unnecessarily includes all the bad images as well.
new_dino_map = {}
for dino, dinoinfo in dinos.iteritems():
    new_dino_map[dino] = dinoinfo

    c = 0
    new_images = []
    for imageinfo in dinoinfo['images']:
        c += 1
        new_image_info = imageinfo
        url = imageinfo['url']
        disassembled = urlparse(url)
        filename, _ = splitext(basename(disassembled.path))
        name = '%s_%s_%d' % (dino, filename, c)
        try:
            print 'Uploading', url, 'as', name
            cloudinary_url = cloudinary.uploader.upload(url, public_id=name)['secure_url']
        except:
            print 'Upload failed'
            new_image_info['cloudinary_url'] = None
            new_dino_map[dino].append(new_image_info)
            continue
        print 'Uploaded to', cloudinary_url

        new_image_info['cloudinary_url'] = cloudinary_url
        new_images.append(new_image_info)

    new_dino_map[dino]['images'] = new_images

f = open('processed_all_cloudinary.json', 'w')
f.write(json.dumps(new_dino_map, indent=2))
f.close()
