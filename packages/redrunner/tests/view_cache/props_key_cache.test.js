/*
This checks whether nested views which are detached get told to update,
which they shouldn't.

*/

import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :nest="|..names|NestedView:id">
    </div>
  `
}

class NestedView extends View {
  __html__ = `
    <span>{{name}}</span>
  `
  init() {
    this.uniqueSeq = getSeq()
  }
  update(props) {
    super.update(props)
    updateCounter(this.uniqueSeq)
  }
}


// Code to track how many times each view was updated.
let _seq = 0
const _counter = {}
const getSeq = () => {
  _seq ++
  return _seq
}
const updateCounter = (uniqueSeq) => {
  if (!(uniqueSeq in _counter)) {
    _counter[uniqueSeq] = 0
  }
  _counter[uniqueSeq] ++
}


const names = [
  {id: 1, name: 'apple'},
  {id: 2, name: 'carrot'},
  {id: 3, name: 'kiwi'}
]
const div = load(TestView)
//* Run this first to make sure load isn't accidentally called twice somewhere
test('Nested views update just once on load', () => {
  expect(div).toShow(`
    <div>
      <span>apple</span>
      <span>carrot</span>
      <span>kiwi</span>
    </div>
  `)
  expect(_counter).toEqual({1:1, 2:1, 3:1})
})

test('Nested views update again', () => {
  names.push({id: 4, name: 'orange'})
  div.update()
  expect(div).toShow(`
    <div>
      <span>apple</span>
      <span>carrot</span>
      <span>kiwi</span>
      <span>orange</span>
    </div>
  `)
  expect(_counter).toEqual({1:2, 2:2, 3:2, 4:1})
})

test('Removed views are not updated', () => {
  names.length = 0
  names.push({id: 5, name: 'lemons'})
  div.update()
  expect(div).toShow(`
    <div>
      <span>lemons</span>
    </div>
  `)
  expect(_counter).toEqual({1:2, 2:2, 3:2, 4:1, 5:1})
})

test('Readed items us their old views', () => {
  names.push({id: 1, name: 'apple'})
  div.update()
  expect(div).toShow(`
    <div>
      <span>lemons</span>
      <span>apple</span>
    </div>
  `)
  expect(_counter).toEqual({1:3, 2:2, 3:2, 4:1, 5:2})
})