#!/bin/bash

pushd `dirname $0`
cd "$(git rev-parse --show-toplevel)"
mkdir -p /var/log/dinos

echo "starting @ `date`"

# node
NODE_ENV=production
supervisor web/dinos.js 2>> /var/log/dinos/node.err.log 1>> /var/log/dinos/node.out.log &

for job in `jobs -p`
do
echo $job
  wait $job
done

popd
