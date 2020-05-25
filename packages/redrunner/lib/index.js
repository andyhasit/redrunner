"use strict";

var _view = require("./view");

var _utils = require("./utils");

var _viewCache = require("./view-cache");

module.exports = {
  mount: _utils.mount,
  h: _utils.h,
  isStr: _utils.isStr,
  View: _view.View,
  ViewCache: _viewCache.ViewCache,
  wrap: _utils.wrap,
  Wrapper: _utils.Wrapper
};