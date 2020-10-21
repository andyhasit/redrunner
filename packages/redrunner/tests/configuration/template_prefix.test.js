/*
This test ensures we can have a tag in front of a html templated string,
which some html-in-es6 syntax highlighters require to work.
*/

import {c, h, load, View} from '../utils'

class TestView1 extends View {
  __html__ = `<div>Hello</div>`
}

class TestView2 extends View {
  __html__ = html`<div>Hello</div>`
}

class TestView3 extends View {
  __html__ = '<div>Hello</div>'
}


test('Prefix is ignored', () => {
  let div = load(TestView1)
  expect(div).toShow(`<div>Hello</div>`)
  div = load(TestView2)
  expect(div).toShow(`<div>Hello</div>`)
  div = load(TestView3)
  expect(div).toShow(`<div>Hello</div>`)
})