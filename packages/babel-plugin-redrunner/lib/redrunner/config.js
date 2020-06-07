const {c} = require('../utils/constants')
const {capitalize} = require('../utils/javascript')

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
        this.props = expandShorthand(args)
      }
    },
    // ':show': {
    //   params: 'property',
    //   handle: function(property) {
    //     this.shieldQuery = property
    //   }
    // },
    ':watch': {
      params: 'property, converter, target?',
      handle: function(property, converter, target) {
        this.addWatch(property, converter, target)
      }
    },
    ':wrapper': {
      params: 'wrapperClass',
      handle: function(wrapperClass) {
        this.wrapperClass = wrapperClass
      }
    }
  }
}


const events = ['click', 'keyUp', 'keyDown']
events.forEach(event => {
  config.directives[':on' + capitalize(event)] = {
    params: 'callbackStr',
    handle: function(callbackStr) {
      this.addEventListener(event, callbackStr)
    }
  }
})


module.exports = {config}
