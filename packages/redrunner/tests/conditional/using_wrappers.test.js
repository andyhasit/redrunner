import {c, h, load, View} from '../utils'

let items = [1, 2, 3]

class TestView extends View {
  __html__ = `
	  <div :watch="*|.getContents?|inner"></div>
  `
  getContents() {
    return items.length ? items.map(i => h('div', i)) : h('div', 'no items')
  }
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
