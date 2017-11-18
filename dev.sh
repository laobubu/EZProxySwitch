#!/bin/sh
#
# Usage:
#  $ ./dev.sh build       Build extension.zip
#  $ ./dev.sh             Watch and Babel .js files

rm -rf dist
mkdir dist
cp -R icons popup pac.js manifest.json dist

mkdir dist/options
cp options/index.html dist/options

export NODE_ENV=production

if [ "$1" == "build" ]; then
  export PACKING=true
  npm run build
  zipfile="extension.zip"

  [ -f $zipfile ] && rm -f $zipfile

  cd dist
  zip -r -FS ../$zipfile *
  cd ..
else
  npm run dev
fi
