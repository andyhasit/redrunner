/*
This checks whether nested views which are detached get told to update,
which they shouldn't.

*/

import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :items="*|..names|NestedView">
    </div>
  `
}

class NestedView extends View {
  __clone__ = `
    <span>{{.props}}</span>
  `
  init() {
    this.uniqueSeq = getSeq()
  }
  update() {
    super.update()
    updateCounter(this.uniqueSeq)
  }
}

/*
Code to track how many times each view was updated.
*/
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


const names = ['apple', 'carrot', 'kiwi']
const div = load(TestView)

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
