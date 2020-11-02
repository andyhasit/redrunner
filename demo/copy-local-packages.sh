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

_rebuild 'redrunner-router'
_rebuild 'redrunner'

_copy 'redrunner/dist'
_copy 'redrunner-router/dist'
_copy 'babel-plugin-redrunner/lib'
