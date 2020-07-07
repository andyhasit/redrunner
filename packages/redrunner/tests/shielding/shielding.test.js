import {c, h, load, View} from '../utils'

class TestView extends View {
  __html__ = `
    <div>
      <div :show="show">
        <div :watch="*|message|text"/>
      </div>
    </div>
  `
}


const props = {
  show: true,
  message: 'hello'
}


test("Show blocks nested watches", () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <div style="visibility: visible;">
        <div>hello</div>
      </div>
    </div>
  `)
  props.show = false
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: hidden;">
        <div>hello</div>
      </div>
    </div>
  `)
  props.message = 'goodbye'
  div.update()

  // Nothing should change
  expect(div).toShow(`
    <div>
      <div style="visibility: hidden;">
        <div>hello</div>
      </div>
    </div>
  `)

  props.show = true
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: visible;">
        <div>goodbye</div>
      </div>
    </div>
  `)
})
