/**
 * The object which holds the directive definitions.
 * 
 * A directive definition's handler's "this" is a NodeData instance.
 */


const config = {
  directives: {
    ':as': {
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
        this.addWatch(property, converter, 'items')
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
        this.props = this.expandPrefix(args)
      }
    },
    ':show': {
      params: 'property',
      handle: function(property) {
        this.shieldQuery = property
        this.reverseShield = 1
      }
    },
    ':replace': {
      params: 'viewCls, props?',
      handle: function(viewCls, props) {
        this.replaceWith = this.expandPrefix(viewCls, true)
        if (props) {
          this.props = this.expandPrefix(props)
        }
      }
    },
    ':watch': {
      params: 'property, converter, target?',
      handle: function(property, converter, target) {
        this.addWatch(property, converter, target)
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


module.exports = {config}
