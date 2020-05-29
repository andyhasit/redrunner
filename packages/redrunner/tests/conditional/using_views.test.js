/*

These test are breaking as I explore a new way of making it work.
Make this a hide & show. Use cached objects too.

*/


import {c, h, load, View} from '../utils'

let items = [1, 2, 3]

class TestView extends View {
  __html__ = `
    <div>
      <div ::="*|.showContents?|visible">
        <div ::="*|.getContents?|inner"></div>
      </div>
	    <div ::="*|.showTotal?|visible">
        <div ::="*|.getContents?|inner"></div>
      </div>
    </div>
  `
  inner() {
    this.noItems = this.nest(NoItemsView)
  }
  getContents() {
    return items.length ? items.map(i => h('div', i)) : this.noItems
  }
}


class NoItemsView extends View {
  __html__ = '<div>no items</div>'
}

test("Inner contents update", () => {
  const div = load(TestView)
  expect(div).toShow(`
  	<div>
	    <div>1</div>
      <div>2</div>
      <div>3</div>
    </div>
  `)
  items = []
  div.update()
  expect(div).toShow(`
    <div>
      <div>no items</div>
    </div>
  `)
  items = [4, 5]
  div.update()
  expect(div).toShow(`
    <div>
      <div>4</div>
      <div>5</div>
    </div>
  `)
})
