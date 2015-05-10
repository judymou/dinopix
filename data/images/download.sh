#!/bin/bash

while read -r line; do
  filename=$(echo $line | tr / _)
  if [ ! -f $filename ]; then
    timeout 35 wget "$line" -O "images/$filename" --timeout 10 --tries 2
  fi
done
