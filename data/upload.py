#!/usr/bin/env python
import secrets
import cloudinary
import cloudinary.uploader
import cloudinary.api
from urlparse import urlparse
from os.path import splitext, basename
import json

cloudinary.config(
    cloud_name = "dinopics",
    api_key = secrets.API_KEY,
    api_secret = secrets.API_SECRET,
)

cloudinary.api.delete_all_resources()

f = open('json', 'r')
dinos = json.loads(f.read())
f.close()

new_dino_map = {}
for dino, pics in dinos.iteritems():
    new_dino_map[dino] = []

    c = 0
    for url in pics:
        c += 1
        pic_data = {}
        pic_data['original'] = url
        disassembled = urlparse(url)
        filename, _ = splitext(basename(disassembled.path))
        name = '%s_%s_%d' % (dino, filename, c)
        try:
            print 'Uploading', url, 'as', name
            cloudinary_url = cloudinary.uploader.upload(url, public_id=name)['secure_url']
        except:
            print 'Upload failed'
            pic_data['cloudinary'] = None
            new_dino_map[dino].append(pic_data)
            continue
        print 'Uploaded to', cloudinary_url

        pic_data['cloudinary'] = cloudinary_url
        new_dino_map[dino].append(pic_data)

f = open('uploaded_dino_map', 'w')
f.write(json.dumps(new_dino_map, indent=2))
f.close()
