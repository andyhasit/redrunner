'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var redrunner = require('redrunner');

/*
 * The defaultKeyFn for a route's ComponentPool.
 * It returns 1, which causes the same component to be reused each time, which is most likely
 * what we want, but means the component should must be stateless.
 */

var defaultKeyFn = function defaultKeyFn(_) {
  return 1;
};

var defautResolve = function defautResolve(routeData) {
  return Promise.resolve(routeData);
};
/* RouterComponent
 * A component which responds to changes in the hash url.
 * The props must be an array of routes.
 */


var Router = redrunner.Component.prototype.__ex(redrunner.Component, {
  init: function init() {
    var _this = this;

    this._routes = this.props.map(function (config) {
      return new Route(config);
    });
    this._active = undefined;
    window.addEventListener('hashchange', function (e) {
      return _this._hashChanged();
    });
    window.addEventListener('load', function (e) {
      return _this._hashChanged();
    });
    redrunner.Component.prototype.init.apply(this);
  },
  _hashChanged: function _hashChanged() {
    var url = location.hash.slice(1) || '/';

    this._matchRoute(url);
  },

  /*
   * Tries to find a component based on url, and will build it
   */
  _matchRoute: function _matchRoute(url) {
    var _this2 = this;

    var len = this._routes.length,
        matched = false;

    for (var i = 0; i < len; i++) {
      var route = this._routes[i];
      var routeData = route.match(url);

      if (routeData) {
        matched = true;
        route.getComponent(routeData).then(function (component) {
          _this2.e.innerHTML = '';

          _this2.e.appendChild(component.e);

          _this2.__mt.flush();

          _this2._active = component;
        });
        break;
      }
    }

    if (!matched) {
      throw new Error('Route not matched: ' + url);
    }
  },
  update: function update() {
    if (this._active) {
      this._active.update();
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
 *   cls: TodoComponent,
 *   keyFn: foo,            # optional used as cache arg for component
 *   resolve: foo,          # optional used to create data for component
 * }
 *
 * The path may specify params after ? (but all params are passed to the component anyway)
 *  /todos/detail?id,date
 *
 * Args and params may specify a type, in which case they are converted.
 * resolve gets called with (routeData, [this router]) and must return a promise, the return
 * value is passed as data to the component. routeData is {args, params, url}
 */

var Router_prototype = Router.prototype;
Router_prototype.__ht = '<div></div>';
Router_prototype.__wc = [];
Router_prototype.__qc = Router_prototype.__lu({});
Router_prototype.__ip = {};

Router_prototype.__bv = function (component, prototype) {
  component.__bd(prototype);

  component.el = {};
};

Router_prototype.__cn = undefined;
function Route(config) {
  this._vc = new redrunner.KeyedPool(config.cls, config.keyFn || defaultKeyFn);
  this.chunks = this.buildChunks(config.path);
  this.resolve = config.resolve || defautResolve;
}
Route.prototype = {
  buildChunks: function buildChunks(path) {
    return path.split('/').map(function (s) {
      if (s.startsWith('{')) {
        return new RouteArg(s.slice(1, -1));
      }

      return s;
    });
  },
  getComponent: function getComponent(routeData) {
    var _this3 = this;

    return this.resolve(routeData, this).then(function (result) {
      return _this3._vc.getOne(result, _this3);
    });
  },
  match: function match(url) {
    var definedChunkCount = this.chunks.length,
        args = {};
    var foundChunks = url.split('?', 1)[0].split('/');

    if (definedChunkCount !== foundChunks.length) {
      return false;
    } // determine if non interpreted chunks match.


    for (var i = 0; i < definedChunkCount; i++) {
      var definedChunk = this.chunks[i];
      var foundChunk = foundChunks[i];

      if (definedChunk instanceof RouteArg) {
        args[definedChunk.name] = [definedChunk, foundChunk];
      } else if (redrunner.isStr(definedChunk) && definedChunk != foundChunk) {
        return false;
      }
    } // If we reach here, url matches, so process args and params


    Object.keys(args).forEach(function (key) {
      var definedChunk = args[key][0];
      var foundChunk = args[key][1];
      args[key] = definedChunk.convert(foundChunk);
    });
    /*
    TODO: consider replacing with something like this:
      queryParams: function() {
      var reducer = function(accumulator, currentValue) {
        if (currentValue.includes('=')) {
          var chunks = currentValue.split('=')
          c.log(chunks);
          c.log(decodeURIComponent(chunks[1]));
          accumulator[chunks[0]] = replaceAll(decodeURIComponent(chunks[1]), '+', ' ')
        }
        return accumulator
      };
      return window.location.search.substring(1).split('&').reduce(reducer, {});
    },
    */

    var params = {}; // if (paramStr) {
    //   paramStr.split('&').forEach(e => {
    //     let keyValue = e.split('=')
    //     let k = keyValue[0]
    //     let v = keyValue[1]
    //     v = decodeURIComponent(v).split('+').join(' ');
    //     if (this.params.hasOwnProperty(k)) {
    //       params[k] = this.params[k].convert(v)
    //     } else {
    //       params[k] = v
    //     }
    //   })
    // }

    return {
      args: args,
      params: params,
      url: url
    };
  }
};
function RouteArg(str) {
  // No error checks :-(
  var argType;
  var chunks = str.split(':');
  this.name = chunks[0];

  if (chunks.length > 0) {
    argType = chunks[1];
  }

  switch (argType) {
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
