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
bucket = conn.get_bucket('dinosaur-pictures')
bucket.set_acl('public-read')

MAX_WIDTH = 900

def compute_tag(url):
    return hashlib.sha1(url.encode('utf-8')).hexdigest()[:4]

def key_from_url(url):
    tag = compute_tag(url)
    disassembled = urlparse(url)
    filename, ext = splitext(basename(disassembled.path))

    # converted everything to jpg
    ext = '.jpg'

    quoted_full_name = '%s_%s%s' % (filename, tag, ext)

    unquoted_full_name = urllib.unquote(quoted_full_name)

    if quoted_full_name != unquoted_full_name:
        # url incorrectly uploaded with quotes
        k = bucket.get_key(quoted_full_name)
        if k:
            print 'deleting', quoted_full_name
            k.delete()
    return unquoted_full_name

def upload(url):
    try:
        url = url.encode('utf-8')
        name = key_from_url(url)
        if bucket.get_key(name):
            print 'Already exists!'
            return
        k = Key(bucket)
        k.key = name
        file_object = urllib2.urlopen(url, timeout=30)           # 'Like' a file object
        fp = StringIO.StringIO(file_object.read())   # Wrap object
        im = Image.open(fp)

        width, height = im.size
        if width > MAX_WIDTH:
            ratio = MAX_WIDTH * 1./width
            new_width, new_height  = int(width * ratio), int(height * ratio)
            print 'Resizing image', width, height, 'to', new_width, new_height
            im = im.resize((new_width, new_height))
        uploadfp = StringIO.StringIO()
        im.convert('RGB').save(uploadfp, 'JPEG')
        uploadfp.seek(0)

        print 'Uploading', url, '\n\tto', name

        k.set_contents_from_file(uploadfp)
        k.set_acl('public-read')
    except Exception, e:
        f = open('uploadserrors', 'a')
        f.write('%s %s\n' % (url, str(e)))
        print e

f = open('processed_all_cloudinary.json', 'r')
dinos = json.loads(f.read())
f.close()

for dino, dinostuff in dinos.iteritems():
    for image in dinostuff['images']:
        url = image['url'].encode('utf-8')
        upload(url)
