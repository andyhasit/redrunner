import {Store} from './store'

export const smoothiesService = new Store([
  {
    name: 'Morning Glory',
    contents: {
      2: 2,
      4: 4,
      1: 20
    },
    price: 200
  },
  {name: 'Don Fruity',
    contents: {
      4: 2,
      5: 4,
      2: 20
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
