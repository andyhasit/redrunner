'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var redrunner = require('redrunner');

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/*
 * The defaultKeyFn for a route's ViewCache.
 * It returns 1, which causes the same view to be reused each time, which is most likely
 * what we want, but means the view should must be stateless.
 */

var defaultKeyFn = function defaultKeyFn(_) {
  return 1;
};
/* RouterView
 * A view which responds to changes in the hash url.
 * Arg 'data' must be an object like {routes, resources}
 *
 * @data.routes: an array of objects which will get passed as arg 'config' to new Route()
 * @data.resources: an object representing load-once resources as name:function
 *   the function will be called with (this) and must return a promise.
 */


var Router = redrunner.View.prototype.__ex(redrunner.View, {
  init: function init() {
    var _this = this;

    var _this$props = this.props,
        routes = _this$props.routes,
        resources = _this$props.resources;
    this._routes = routes.map(function (config) {
      return new Route(config);
    });
    this._resources = {};

    if (resources) {
      for (var _i = 0, _Object$entries = Object.entries(resources); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            name = _Object$entries$_i[0],
            func = _Object$entries$_i[1];

        this._resources[name] = {
          loaded: false,
          func: func
        };
      }
    }

    window.addEventListener('hashchange', function (e) {
      return _this._hashChanged();
    });
    window.addEventListener('load', function (e) {
      return _this._hashChanged();
    });
    redrunner.View.prototype.init.apply(this);
  },

  /*
  */
  _resolveResources: function _resolveResources(resources) {
    var _this2 = this;

    var promises = [];

    if (resources) {
      resources.forEach(function (name) {
        var resource = _this2._resources[name];

        if (!resource.loaded) {
          promises.push(resource.func(_this2));
        }
      });
    }

    return Promise.all(promises);
  },
  _hashChanged: function _hashChanged() {
    var url = location.hash.slice(1) || '/';

    this._matchRoute(url);
  },

  /*
   * Tries to find a view based on url, and will build it
   */
  _matchRoute: function _matchRoute(url) {
    var _this3 = this;

    var len = this._routes.length,
        matched = false;

    var _loop = function _loop(i) {
      var route = _this3._routes[i];
      var routeData = route.match(url);

      if (routeData) {
        matched = true;

        _this3._resolveResources(route.resources).then(function (_) {
          route.getView(routeData).then(function (view) {
            _this3.e.innerHTML = '';

            _this3.e.appendChild(view.e);

            _this3.__mt.flush(); // Use this? bubble?
            // call back?
            //this.app.emit('route_changed', {routeData, url, view})

          });
        });

        return "break";
      }
    };

    for (var i = 0; i < len; i++) {
      var _ret = _loop(i);

      if (_ret === "break") break;
    }

    if (!matched) {
      throw new Error('Route not matched: ' + url);
    }
  }
}, );
/*
 * A route.
 * The path is used for matching and extracting args & params.
 * The path is made of chunks separated by "/" e.g. /todos/detail/{id}
 * Chunks are strings or argument descriptors
 * A url matches a route if all the string chunks match e.g.
 * Route path: /todos/detail/{id}
 * Urls:
 *   /todos/detail/001           (yes)
 *   /todos/detail/001?name=joe  (yes, as everything after ? are params)
 *   /todos/001/detail           (no, as chunk[1] != 'detail')
 *   /todos/detail/001/next      (no, as it has more chunks than expected)
 *
 * Config example:
 * {
 *   path: '/todos',
 *   resources: ['todos', 'settings'],
 *   cls: TodoView,
 *   keyFn: foo,            # optional used as cache arg for view
 *   resolve: foo,          # optional used to create data for view
 * }
 *
 * The path may specify params after ? (but all params are passed to the view anyway)
 *  /todos/detail?id,date
 *
 * Args and params may specify a type, in which case they are converted.
 * resolve gets called with (routeData, [this router]) and must return a promise, the return
 * value is passed as data to the view. routeData is {args, params, url}
 */

var p = Router.prototype;
p.__ht = '<div><div></div></div>';
p.__wc = [];
p.__qc = p.__lu({});
p.__ip = {};

p.__bv = function (view, prototype) {
  view.__bd(prototype);

  view.el = {};
};

p.__cn = undefined;
function Route(config) {
  this.resources = config.resources;
  var paramStr,
      path = config.path;
  this._vc = new redrunner.KeyedCache(config.cls, config.keyFn || defaultKeyFn);

  var _path$split = path.split('?');

  var _path$split2 = _slicedToArray(_path$split, 2);

  path = _path$split2[0];
  paramStr = _path$split2[1];
  this.chunks = this.buildChunks(path); // An array of string or RouteArg

  this.params = this.buildParams(paramStr);
  this.resolve = config.resolve || this.defautResolve;
}
var p = Route.prototype;

p.defautResolve = function (routeData) {
  return Promise.resolve(routeData);
};

p.buildChunks = function (path) {
  return path.split('/').map(function (s) {
    if (s.startsWith('{')) {
      return new RouteArg(s.slice(1, -1));
    }

    return s;
  });
};

p.buildParams = function (paramStr) {
  var params = {};

  if (paramStr) {
    paramStr.split(',').forEach(function (s) {
      var r = new RouteArg(s.trim());
      params[r.name] = r;
    });
  }

  return params;
};

p.getView = function (routeData) {
  var _this4 = this;

  return this.resolve(routeData, this).then(function (result) {
    return _this4._vc.getOne(result, _this4);
  });
};

p.match = function (url) {
  var _this5 = this;

  var front,
      paramStr,
      definedChunkCount = this.chunks.length,
      args = {};

  var _url$split = url.split('?');

  var _url$split2 = _toArray(_url$split);

  front = _url$split2[0];
  paramStr = _url$split2.slice(1);
  var foundChunks = front.split('/');

  if (definedChunkCount !== foundChunks.length) {
    return false;
  } // determine if non interpreted chunks match.


  var _loop2 = function _loop2(i) {
    var definedChunk = _this5.chunks[i];
    var foundChunk = foundChunks[i];

    if (definedChunk instanceof RouteArg) {
      args[definedChunk.name] = function (_) {
        return definedChunk.convert(foundChunk);
      };
    } else if (redrunner.isStr(definedChunk) && definedChunk != foundChunk) {
      return {
        v: false
      };
    }
  };

  for (var i = 0; i < definedChunkCount; i++) {
    var _ret2 = _loop2(i);

    if (_typeof(_ret2) === "object") return _ret2.v;
  } // If we reach here, url matches, so process args and params


  for (var a in args) {
    args[a] = args[a]();
  } // paramStr had to be an array in case multiple "?" in url


  var params = {};

  if (paramStr) {
    paramStr.join('').split('&').forEach(function (e) {
      var k, v;

      var _e$split = e.split('=');

      var _e$split2 = _slicedToArray(_e$split, 2);

      k = _e$split2[0];
      v = _e$split2[1];
      v = decodeURIComponent(v).split('+').join(' ');

      if (_this5.params.hasOwnProperty(k)) {
        params[k] = _this5.params[k].convert(v);
      } else {
        params[k] = v;
      }
    });
  }

  return {
    args: args,
    params: params,
    url: url
  };
};

function RouteArg(str) {
  // No error checks :-(
  var name, conv;

  var _str$split = str.split(':');

  var _str$split2 = _slicedToArray(_str$split, 2);

  name = _str$split2[0];
  conv = _str$split2[1];
  this.name = name;

  switch (conv) {
    case 'int':
      this.conv = function (v) {
        return parseInt(v);
      };

      break;

    case 'float':
      this.conv = function (v) {
        return parseFloat(v);
      };

      break;

    default:
      this.conv = function (v) {
        return v;
      };

  }
}

RouteArg.prototype.convert = function (val) {
  return this.conv(val);
};

exports.Route = Route;
exports.RouteArg = RouteArg;
exports.Router = Router;
