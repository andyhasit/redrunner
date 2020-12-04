import {load, View} from '../utils'


class TestView extends View {
  __html__ = html`
    <div>
      Title: {..title} <a href="#more">Read more</a> Written by {..author}
    </div>
  ` 
}

const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes'}

test('Can have inlines in non-leaf nodes', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      Title: Flowers for Algernon <a href="#more">Read more</a> Written by Daniel Keyes
    </div>
  `)
})