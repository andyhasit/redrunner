import {c, h, load, View} from '../utils'

class TestView extends View {
  __html__ = `
    <div>
      <div :show="show">
        <div :watch="*|message.|text"/>
      </div>
    </div>
  `
}


const props = {
  show: true,
  message: 'hello'
}


test("The :show directive stops shielded elements from updating.", () => {
  const div = load(TestView, props)

  // Run some sanity checks first...
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

  // Now check that the shielded element is not updated if show is false.
  props.show = false
  props.message = 'goodbye'
  div.update()
  expect(div).toShow(`
    <div>
      <div style="visibility: hidden;">
        <div>hello</div>
      </div>
    </div>
  `)

  // Now check that the shielded element did update.
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
