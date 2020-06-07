/*
This checks whether nested views which are detached get told to update,
which they shouldn't.

*/

import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :items="*|..fruit|NestedView|id"/>
  `
}

class NestedView extends View {
  __html__ = `
    <div>{{name}}</div>
  `
  init() {
    this.uniqueSeq = counter.next()
  }
  update(props) {
    super.update(props)
    counter.increment(this.uniqueSeq)
  }
}

/*
 * A thing which counts updates.
 */
class UpdateCounter {
  constructor() {
    this.updates = {}
    this._seq = 0
  }
  reset() {
    this.updates = {}
    this._seq = 0
  }
  next() {
    this._seq ++
    return this._seq
  }
  increment(uniqueSeq) {
    if (!(uniqueSeq in this.updates)) {
      this.updates[uniqueSeq] = 0
    }
    this.updates[uniqueSeq] ++
  }
}


let fruit, div, counter = new UpdateCounter()
function init() {
  counter.reset()
  div = load(TestView)
}

// Run this first to make sure update isn't accidentally called twice somewhere.
test('Nested views update just once on load', () => {
  fruit = [
    {id: 1, name: 'apple'},
    {id: 2, name: 'carrot'},
    {id: 3, name: 'kiwi'}
  ]
  init()
  expect(div).toShow(`
    <div>
      <div>apple</div>
      <div>carrot</div>
      <div>kiwi</div>
    </div>
  `)
  expect(counter.updates).toEqual({1:1, 2:1, 3:1})
})

test('Nested views update again', () => {
  fruit = [
    {id: 1, name: 'apple'},
    {id: 2, name: 'carrot'},
    {id: 3, name: 'kiwi'}
  ]
  init()
  fruit.push({id: 4, name: 'orange'})
  div.update()
  expect(div).toShow(`
    <div>
      <div>apple</div>
      <div>carrot</div>
      <div>kiwi</div>
      <div>orange</div>
    </div>
  `)
  expect(counter.updates).toEqual({1:2, 2:2, 3:2, 4:1})
})


test('Removed views are not updated', () => {
  fruit = [
    {id: 1, name: 'apple'},
    {id: 2, name: 'carrot'},
    {id: 3, name: 'kiwi'}
  ]
  init()
  expect(counter.updates).toEqual({1:1, 2:1, 3:1})

  fruit.length = 0
  fruit.push({id: 4, name: 'lemon'})
  div.update()
  expect(div).toShow(`
    <div>
      <div>lemon</div>
    </div>
  `)
  expect(counter.updates).toEqual({1:1, 2:1, 3:1, 4:1})
})

test('Re-added items use their old views', () => {
  fruit = [
    {id: 1, name: 'apple'},
    {id: 2, name: 'carrot'},
    {id: 3, name: 'kiwi'}
  ]
  init()
  expect(counter.updates).toEqual({1:1, 2:1, 3:1})
  fruit.length = 0
  div.update()
  expect(counter.updates).toEqual({1:1, 2:1, 3:1})
  fruit.push({id: 4, name: 'lemon'})
  fruit.push({id: 1, name: 'green apple'})
  div.update()
  expect(counter.updates).toEqual({1:2, 2:1, 3:1, 4:1})
  expect(div).toShow(`
    <div>
      <div>lemon</div>
      <div>green apple</div>
    </div>
  `)
})