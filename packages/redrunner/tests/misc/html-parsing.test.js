import {load, View} from '../utils'

class TestView extends View {
  __html__ = html`
    <div>
      <div>This one's HTML has multiple 's in it                </div>
      <div>             This one has a <a href="_blank">hyperlink</a></div>
    </div>
  `
}


test("HTML parsing preserves quotes and spaces", () => {
  let div = load(TestView)
  expect(div).toShow(`
    <div>
      <div>This one's HTML has multiple 's in it</div>
      <div>This one has a <a href="_blank">hyperlink</a></div>
    </div>
  `)
})
