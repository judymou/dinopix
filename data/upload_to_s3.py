#!/usr/bin/env python
import requests
import secrets
from urlparse import urlparse
from os.path import splitext, basename
import urllib, urllib2
import StringIO
import json
import sys
import boto
from boto.s3.key import Key

conn = boto.connect_s3()
bucket = conn.get_bucket('dinopics')
bucket.set_acl('public-read')

def upload(url):
    try:
        name = '/images/' + urllib.quote(urllib.unquote(url)).replace('/', '_')
        if bucket.get_key(name):
            return "Already exists!"
        k = Key(bucket)
        k.key = name
        file_object = urllib2.urlopen(url)           # 'Like' a file object
        fp = StringIO.StringIO(file_object.read())   # Wrap object
        k.set_contents_from_file(fp)
        k.set_acl('public-read')
        return "Success"
    except Exception, e:
        return e

f = open('processed_all_cloudinary.json', 'r')
dinos = json.loads(f.read())
f.close()

for dino, dinostuff in dinos.iteritems():
    for image in dinostuff['images']:
        url = image['url'].encode('utf-8')
        print 'Uploading', url
        print upload(url)
