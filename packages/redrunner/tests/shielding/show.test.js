import {c, h, load, View} from '../utils'

class TestView extends View {
  __html__ = `
    <div>
      <div :show="show" :watch="*|.getContents|inner">
      </div>
    </div>
  `
  getContents() {
    return this.props.items.map(i => h('div', i))
  }
}

const props = {
  show: true,
  items: [1, 2, 3]
}


test("The :show directive stops its own element from updating.", () => {
  const div = load(TestView, props)

  // Run some sanity checks first...
  expect(div).toShow(`
  	<div>
      <div style="visibility: visible;">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)
  props.show = false
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: hidden;">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)


  // Now check that the shielded element is not updated if show is false.
  props.show = false
  props.items = [4, 5]
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: hidden;">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    </div>
  `)

  props.show = true
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: visible;">
        <div>4</div>
        <div>5</div>
      </div>
    </div>
  `)
})
