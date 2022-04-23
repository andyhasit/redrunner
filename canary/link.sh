#!/usr/bin/env bash

function _rebuild () {
  echo "rebuilding $1"
  cd ../packages/$1 && npm run build
  cd -
}

function _copy () {
  cp -r ../packages/$1/* node_modules/$1

  echo "copied files to node_modules/$1"
}

function _link () {
  ABS=`realpath ../packages/$1`
  rm -rf node_modules/$1
  ln -s $ABS node_modules/$1
  echo Linked $ABS
}

# This we can just link because there is no dist.
_link 'babel-plugin-redrunner'

# This we need to rebuild but can link.
_rebuild 'redrunner'
_link 'redrunner'

# This we need to rebuild and copy. If we just link it then it won't find redrunner.
_rebuild 'redrunner-router'
_copy 'redrunner-router'
