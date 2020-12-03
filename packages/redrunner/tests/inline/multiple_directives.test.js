import {load, View} from '../utils'


class TestView extends View {
  __html__ = html`
    <div>
      The book {..title} was written by {..author|allCaps(c, n)}
    </div>
  `
  
}

const allCaps = (c, n) => n.toUpperCase()
const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes'}

test('Can have multiple inlines in text', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
    The book Flowers for Algernon was written by DANIEL KEYES
    </div>
  `)
})