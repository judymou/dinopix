#!/usr/bin/env python
import secrets
from urlparse import urlparse
from os.path import splitext, basename
import urllib, urllib2
import cStringIO as StringIO
import json
import sys
import boto
import hashlib

from boto.s3.key import Key
from PIL import Image

conn = boto.connect_s3()
bucket = conn.get_bucket('dinosaurs')
bucket.set_acl('public-read')

MAX_WIDTH = 900

def compute_tag(url):
    return hashlib.sha1(url.encode('utf-8')).hexdigest()

def key_from_url(url):
    tag = compute_tag(url)
    disassembled = urlparse(url)
    filename, ext = splitext(basename(disassmebled.path))

    return '/images/%s_%s%s' % (filename, tag, ext)

    #return '/images/' + urllib.quote(urllib.unquote(url)).replace('/', '_')

def upload(url):
    try:
        name = key_from_url(url)
        if bucket.get_key(name):
            return "Already exists!"
        k = Key(bucket)
        k.key = name
        file_object = urllib2.urlopen(url)           # 'Like' a file object
        fp = StringIO.StringIO(file_object.read())   # Wrap object
        im = Image.open(fp)

        uploadfp = StringIO()
        width, height = im.size
        if width > max_width:
            ratio = max_width * 1./width
            new_width, new_height  = int(width * ratio), int(height * ratio)
            print 'Resizing image', width, height, 'to', new_width, new_height
            im.resize(new_width, new_height)
        im.save(uploadfp, 'JPEG')

        print 'Uploading', url, '\n\tto', name

        k.set_contents_from_file(fp)
        k.set_acl('public-read')
    except Exception, e:
        print e

f = open('processed_all_cloudinary.json', 'r')
dinos = json.loads(f.read())
f.close()

for dino, dinostuff in dinos.iteritems():
    for image in dinostuff['images']:
        url = image['url'].encode('utf-8')
        upload(url)
