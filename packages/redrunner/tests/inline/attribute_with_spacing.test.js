import {c, load, View} from '../utils'


class TestView1 extends View {
  __html__ = '<span class="  {{style}} "></span>'
}
test('Start and end spacing are stripped', () => {
  const div = load(TestView1, {style: 'danger'})
  expect(div).toShow('<span class="danger"></span>')
})


class TestView2 extends View {
  __html__ = '<span class="span-{{style}}"></span>'
}
test('No space added before if there is none', () => {
  const div = load(TestView2, {style: 'danger'})
  expect(div).toShow('<span class="span-danger"></span>')
})


class TestView3 extends View {
  __html__ = '<span class="span {{style}}  "></span>'
}
test('Space before is preserved if there is any', () => {
  const div = load(TestView3, {style: 'danger'})
  expect(div).toShow('<span class="span danger"></span>')
})


class TestView4 extends View {
  __html__ = '<span class=" {{style}} special "></span>'
}
test('Space after is preserved if there is any', () => {
  const div = load(TestView4, {style: 'danger'})
  expect(div).toShow('<span class="danger special"></span>')
})


class TestView5 extends View {
  __html__ = '<span class="{{style}}-special"></span>'
}
test('No space added after if there is none', () => {
  const div = load(TestView5, {style: 'danger'})
  expect(div).toShow('<span class="danger-special"></span>')
})