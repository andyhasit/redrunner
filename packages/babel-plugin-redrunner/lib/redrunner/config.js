
const config = {
  // argParsers: {
  //   'property',
  //   'converter'
  // },
  directives: {
    ':as': {
      handle: function(arg) {
        this.saveAs = arg
      }
    },
    ':on': {
      args: ['string', 'eventHandler'],
      handle: function(args) {
        this.addEventListener(...args)
      }
    },
    ':watch': {
      args: ['property', 'converter', 'target?'],
      handle: [],
    }
    // ':visible': {
    //   args: ['property', 'converter'],
    //   actions: {
    //     watch: {
    //       method: 'visible',
    //       args: 'n',
    //       },
    //     shield: true // Shields nested wrappers from being updated
    //   }
    // },


  }
}




module.exports = {config}