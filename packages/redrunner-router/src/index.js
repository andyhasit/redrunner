import {View, KeyedCache, isStr} from 'redrunner'

/*
 * The defaultKeyFn for a route's ViewCache.
 * It returns 1, which causes the same view to be reused each time, which is most likely
 * what we want, but means the view should must be stateless.
 */
const defaultKeyFn = _ => 1
const defautResolve = (routeData) => Promise.resolve(routeData)

/* RouterView
 * A view which responds to changes in the hash url.
 * The props must be an array of routes.
 */
export const Router = View.__ex__('<div></div>', {
  init() {
    this._routes = this.props.map(config => new Route(config))
    this._active = undefined
    window.addEventListener('hashchange', e => this._hashChanged())
    window.addEventListener('load', e => this._hashChanged())
    View.prototype.init.apply(this)
  },
  _hashChanged() {
    let url = location.hash.slice(1) || '/';
    this._matchRoute(url);
  },
  /*
   * Tries to find a view based on url, and will build it
   */
  _matchRoute(url) {
    let len = this._routes.length, matched=false;
    for (let i=0; i<len; i++) {
      let route = this._routes[i];
      let routeData = route.match(url)
      if (routeData) {
        matched = true
        route.getView(routeData).then(view => {
          this.e.innerHTML = ''
          this.e.appendChild(view.e)
          this.__mt.flush()
          this._active = view
        })
        break
      }
    }
    if (!matched) {
      throw new Error('Route not matched: ' + url)
    }
  },
  update() {
    if (this._active) {
      this._active.update()
    } 
  }
})

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
export function Route(config) {
  this._vc = new KeyedCache(config.cls, config.keyFn || defaultKeyFn);
  this.chunks = this.buildChunks(config.path)
  this.resolve = config.resolve || defautResolve
}

Route.prototype = {
  buildChunks(path) {
    return path.split('/').map(s => {
      if (s.startsWith('{')) {
        return new RouteArg(s.slice(1, -1))
      }
      return s
    })
  },
  getView(routeData) {
    return this.resolve(routeData, this).then(result => this._vc.getOne(result, this))
  },
  match(url) {
    const definedChunkCount = this.chunks.length, args = {};
    let foundChunks = url.split('?', 1)[0].split('/')
    if (definedChunkCount !== foundChunks.length) {
      return false
    }
    // determine if non interpreted chunks match.
    for (let i=0; i<definedChunkCount; i++) {
      let definedChunk = this.chunks[i]
      let foundChunk = foundChunks[i]
      if (definedChunk instanceof RouteArg) {
        args[definedChunk.name] = [definedChunk, foundChunk]
      } else if (isStr(definedChunk) && definedChunk != foundChunk) {
        return false
      }
    }
    // If we reach here, url matches, so process args and params
    Object.keys(args).forEach(function(key) {
      let definedChunk = args[key][0]
      let foundChunk = args[key][1]
      args[key] = definedChunk.convert(foundChunk)
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
    let params = {}
    // if (paramStr) {
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
    return {args, params, url}
  }
}

export function RouteArg(str) {
  // No error checks :-(
  let name, argType
  let chunks = str.split(':')
  this.name = chunks[0]
  if (chunks.length > 0) {
    argType = chunks[1]
  }
  switch (argType) {
    case 'int':
      this.conv = v => parseInt(v);
      break;
    case 'float':
      this.conv = v => parseFloat(v);
      break;
    default:
      this.conv = v => v;
  }
}

RouteArg.prototype.convert = function(val) {
  return this.conv(val)
}

