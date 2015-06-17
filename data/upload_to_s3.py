#!/usr/bin/env python
import secrets
import copy
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
        s3_url = 'http://images.dinosaurpictures.org/' + name
        if bucket.get_key(name):
            #print 'Already exists!'
            return s3_url
        k = Key(bucket)
        k.key = name
        headers = { 'User-Agent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.65 Safari/537.36' }
        request = urllib2.Request(url, headers=headers)           # 'Like' a file object
        file_object = urllib2.urlopen(request, timeout=30)
        fp = StringIO.StringIO(file_object.read())   # Wrap object
        im = Image.open(fp)

        width, height = im.size
        if width > MAX_WIDTH:
            ratio = MAX_WIDTH * 1./width
            new_width, new_height  = int(width * ratio), int(height * ratio)
            print 'Resizing image', width, height, 'to', new_width, new_height
            im = im.resize((new_width, new_height))
        uploadfp = StringIO.StringIO()

        # Preserve transparency if the image is in Pallette (P) mode.
        transparency_formats = ('PNG', 'GIF', )
        transparency = None
        if im.mode == 'P' and format in transparency_formats:
            transparency = len(im.split()[-1].getcolors())
        else:
            im = im.convert('RGB')

        im.save(uploadfp, 'JPEG', transparency=transparency)
        uploadfp.seek(0)

        print 'Uploading', url, '\n\tto', name

        k.set_acl('public-read')
        k.set_metadata('Content-Type', 'image/jpeg')
        k.set_contents_from_file(uploadfp)
        return s3_url
    except Exception, e:
        f = open('uploadserrors', 'a')
        f.write('%s %s\n' % (url, str(e)))
        print e
        return ''

f = open('megascrape/processed_all.json', 'r')
dinos = json.loads(f.read())
f.close()

blacklisted_urls = set()
f = open('../web/reported.txt', 'r')
blacklisted = f.readlines()
f.close()
for line in blacklisted:
    idx = line.find(':')
    url = line[idx+1:].strip()
    dino = line[:idx]
    blacklisted_urls.add(url)

output = {}
for dino, dinostuff in dinos.iteritems():
    output[dino] = copy.deepcopy(dinostuff)
    output[dino]['images'] = []
    for image in dinostuff['images']:
        url = image['url'].encode('utf-8')
        if url in blacklisted_urls:
            print 'Skipping blacklisted url', url
            continue
        uploaded_url = upload(url)
        newimage = image
        newimage['s3_url'] = uploaded_url
        output[dino]['images'].append(newimage)
f = open('processed_s3.json', 'w')
f.write(json.dumps(output, indent=2))
f.close()
