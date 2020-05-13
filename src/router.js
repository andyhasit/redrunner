import {Component} from './component'
import {ComponentCache, isStr} from './utils'


/*
 * Router - an object responsible for managing routes

 -- how do we cache and update views?

When a route is first activated, the view gets instantiated and we call update()
When a route is reactivated, there are options:
  - build a completely new view
  - retrieve a cached view based on args
  - always reuse the same view

Todo:
  change route to accept a cache - else it creates its own

  this.cache()

https://blog.pshrmn.com/entry/how-single-page-applications-work/


params vs vars
*/


/* RouterView
 * A view which responds to changes in the hash url.
 * Arg 'data' must be an object like {routes, resources}
 * 
 * @data.routes: an array of objects which will get passed as arg 'config' to new Route()
 * @data.resources: an object representing load-once resources as name:function
 *   the function will be called with (app, this) and must return a promise.
 */


export class Router extends Component {
  init() {
    this._routes = this.o.routes.map(config => new Route(this.app, config))
    this._resources = {}
    if (this.o.resources) {
      for (let [name, func] of Object.entries(this.o.resources)) {
        this._resources[name] = {
          loaded: false,
          func: func
        }
      }
    }
    window.addEventListener('hashchange', e => this._hashChanged())
    window.addEventListener('load', e => this._hashChanged())
  }
  /* 
   */
  _resolveResources(resources) {
    let promises = []
    if (resources) {
      resources.forEach(name => {
        let resource = this._resources[name]
        if (!resource.loaded) {
          promises.push(resource.func(this.app, this))
        }
      })
    }
    return Promise.all(promises)
  }
  _hashChanged() {
    let url = location.hash.slice(1) || '/';
    this._matchRoute(url);
  }
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
        this._resolveResources(route.resources).then(_ => {
          route.getComponent(routeData).then(view => {
            this.root.child(view.root)
            // Use this? bubble?
            //this.app.emit('route_changed', {routeData, url, view})
          })
        })
        break
      }
    }
    if (!matched) {
      throw new Error('Route not matched: ' + url)
    }
  }
}

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
 *   cacheBy: foo,            # optional used as cache arg for view
 *   resolve: foo,          # optional used to create data for view
 * }
 * 
 * The path may specify params after ? (but all params are passed to the view anyway)
 *  /todos/detail?id,date
 * 
 * Args and params may specify a type, in which case they are converted.
 * resolve gets called with (routeData, app, [this router]) and must return a promise, the return
 * value is passed as data to the view. routeData is {args, params, url}
 */
export class Route {
  constructor(app, config) {
    this.app = app
    this.resources = config.resources
    let paramStr, path = config.path;
    // if no cacheBy, create one which returns 1 - 
    this._vc = new ComponentCache(app, config.cls, config.cacheBy || this.defautKeyFn);
    [path, paramStr] = path.split('?')
    this.chunks = this.buildChunks(path) // An array of string or RouteArg
    this.params = this.buildParams(paramStr)
    this.resolve = config.resolve || this.defautResolve
  }
  /*
   * Returning 1 causes the same view to be reused each time, which is most likely 
   * what we want, but means the view should rely on update()
   */
  defautCacheBy(data, seq) {
    return 1
  }
  defautResolve(routeData) {
    return Promise.resolve(routeData)
  }
  buildChunks(path) {
    return path.split('/').map(s => {
      if (s.startsWith('{')) {
        return new RouteArg(s.slice(1,-1))
      }
      return s
    })
  }
  buildParams(paramStr) {
    let params = {}
    if (paramStr) {
      paramStr.split(',').forEach(s => {
        let r = new RouteArg(s.trim());
        params[r.name] = r;
      })
    }
    return params
  }
  getComponent(routeData) {
    return this.resolve(routeData, this.app, this).then(result => {return this._vc.getEl(result)})
  }
  match(url) {
    let front, paramStr, definedChunkCount = this.chunks.length, args = {};
    [front, ...paramStr] = url.split('?')
    let foundChunks = front.split('/')
    if (definedChunkCount !== foundChunks.length) {
      return false
    }
    // determine if non interpreted chunks match.
    for (let i=0; i<definedChunkCount; i++) {
      let definedChunk = this.chunks[i]
      let foundChunk = foundChunks[i]
      if (definedChunk instanceof RouteArg) {
        args[definedChunk.name] = _ => definedChunk.convert(foundChunk)
      } else if (isStr(definedChunk) && definedChunk != foundChunk) {
        return false
      }
    }
    // If we reach here, url matches, so process args and params
    for (let a in args) {
      args[a] = args[a]()
    }
    // paramStr had to be an array in case multiple "?" in url
    let params = {}
    if (paramStr) {
      paramStr.join('').split('&').forEach(e => {
        let k, v;
        [k,v] = e.split('=')
        if (this.params.hasOwnProperty(k)) {
          params[k] = this.params[k].convert(v)
        } else {
          params[k] = v
        }
      })
    }
    return {args, params, url}
  }
}

export class RouteArg {
  constructor(str) {
    // No error checks :-(
    let name, conv;
    [name, conv] = str.split(':')
    this.name = name
    switch (conv) {
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
  convert(val) {
    return this.conv(val)
  }
}
