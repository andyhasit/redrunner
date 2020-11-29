/**
 * The object which holds the directive definitions.
 * 
 * A directive definition's handler's "this" is a NodeData instance.
 */
var fs = require('fs');
var path = require('path');


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
      params: 'property',
      handle: function(property) {
        this.shieldQuery = property
      }
    },
    ':inner': {
      params: 'property, converter',
      handle: function(property, converter) {
        this.addWatch(property, converter, 'inner')
      }
    },
    ':items': {
      params: 'property, converter, cacheDef?, cacheKey?',
      handle: function(property, converter, cacheDef, cacheKey) {
        if (cacheDef) {
          this.chainedCalls.push(`cache(${this.buildCacheInit(cacheDef, cacheKey)})`)
        }
        this.addWatch(property, converter, 'items', 'this')
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
      params: 'property',
      handle: function(property) {
        this.shieldQuery = property
        this.reverseShield = 1
      }
    },
    ':swap': {
      params: 'property, mappings, fallback?',
      handle: function(property, mappings, fallback) {
        let args = this.expandDots(mappings)
        if (fallback) {
          args += ', ' + this.expandDots(fallback)
        }
        this.chainedCalls.push(`cache(view.__ic(${args}))`)
        this.addWatch(property, undefined, 'swap', 'this')
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
      params: 'property, converter, wrapperMethod?',
      handle: function(property, converter, wrapperMethod) {
        this.addWatch(property, converter, wrapperMethod)
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
