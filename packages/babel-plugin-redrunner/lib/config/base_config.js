/**
 * The object which holds the directive definitions.
 * 
 * A directive definition's handler's "this" is a NodeData instance.
 */
const fs = require('fs');
const path = require('path');
const componentRefVariable = 'c'; // The variable name by which the component will be known.
const watchAlways = '*';
const watchNever = '';



const config = {
  options: {
    inlineDelimiters: ['{', '}']
  },
  directives: {
    ':el': {
      handle: function(arg) {
        this.saveAs = arg
      }
    },
    ':hide': {
      params: 'watch',
      handle: function(watch) {
        this.shieldQuery = watch
      }
    },
    ':inner': {
      params: 'watch, converter',
      handle: function(watch, converter) {
        this.addWatch(watch, converter, 'inner')
      }
    },
    ':items': {
      params: 'converter, cacheDef?, cacheKey?',
      handle: function(converter, cacheDef, cacheKey) {
        if (cacheDef) {
          this.chainedCalls.push(`cache(${this.buildCacheInit(cacheDef, cacheKey)})`)
        }
        this.addWatch(watchAlways, converter, 'items', componentRefVariable)
      }
    },
    ':items-o': {
      params: 'converter, cacheDef?, cacheKey?',
      handle: function(converter, cacheDef, cacheKey) {
        if (cacheDef) {
          this.chainedCalls.push(`cache(${this.buildCacheInit(cacheDef, cacheKey)})`)
        }
        this.addWatch(watchNever, converter, 'items', componentRefVariable)
      }
    },
    ':items-w': {
      params: 'watch, converter, cacheDef?, cacheKey?',
      handle: function(watch, converter, cacheDef, cacheKey) {
        if (cacheDef) {
          this.chainedCalls.push(`cache(${this.buildCacheInit(cacheDef, cacheKey)})`)
        }
        this.addWatch(watch, converter, 'items', componentRefVariable)
      }
    },
    ':on': {
      params: 'event, callbackStr',
      handle: function(event, callbackStr) {
        this.addEventListener(event, callbackStr)
      }
    },
    ':props': {
      params: 'args',
      handle: function(args) {
        this.props = this.expandProps(args)
      }
    },
    ':show': {
      params: 'watch',
      handle: function(watch) {
        this.shieldQuery = watch
        this.reverseShield = 1
      }
    },
    ':swap': {
      params: 'watch, mappings, fallback?',
      handle: function(watch, mappings, fallback) {
        let args = this.expandDots(mappings)
        if (fallback) {
          args += ', ' + this.expandDots(fallback)
        }
        this.chainedCalls.push(`cache(view.__ic(${args}))`)
        this.addWatch(watch, undefined, 'swap', componentRefVariable)
      }
    },
    ':use': {
      params: 'viewCls, props?',
      handle: function(viewCls, props) {
        this.replaceWith = viewCls
        if (props) {
          this.props = this.expandProps(props)
        }
      }
    },
    ':stub': {
      params: 'stubName',
      handle: function(stubName) {
        this.stubName = stubName
      }
    },
    ':watch': {
      params: 'watch, converter, wrapperMethod?',
      handle: function(watch, converter, wrapperMethod) {
        this.addWatch(watch, converter, wrapperMethod)
      }
    },
    ':wrapper': {
      params: 'cls, args?',
      handle: function(cls, args) {
        this.customWrapperClass = cls
        this.customWrapperArgs = args
      }
    }
  }
}

// Use config file if there is one.
const configFile = path.join(process.cwd(), 'redrunner.config.js')
if (fs.existsSync(configFile)) {
  var userConfig = require(configFile)
  Object.assign(config.directives, userConfig.directives)
  Object.assign(config.options, userConfig.options)
}

module.exports = {config}
