const {c} = require('../utils/constants')
const {capitalize} = require('../utils/javascript')

const config = {
  directives: {
    ':as': {
      handle: function(arg) {
        this.saveAs = arg
      }
    },
    ':on': {
      params: 'event, callbackStr',
      handle: function(event, callbackStr) {
        this.addEventListener(event, callbackStr)
      }
    },
    ':watch': {
      params: 'property, converter, target?',
      handle: function(property, converter, target) {
        this.addWatch(property, converter, target)
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