import {Store} from '../../src/store'

export const smoothies = new Store([
    {
      name: 'Morning Glory', 
      contents: {
        lemon: 2,
        banana: 4,
        grapes: 20
      },
      price: 200
    },
    {name: 'Don Fruity',
      contents: {
        lemon: 2,
        banana: 4,
        grapes: 20
      },
      price: 300
    }
])


// smoothies.getSmoothie = function(id) {
//   return this.items.find(i => i.id == id)
// }

// smoothies.updateSmoothie = function(id, text) {
// 	this.change ++
//   //this.hash[i].text += '!'
// }
