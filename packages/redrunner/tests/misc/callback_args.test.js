import {load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <div>{title}</div>
      <span>{content}</span>
      <span>{footer}</span>
    </div>
  `
}

test("Second instance of view works", () => {
  let div = load(TestView, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)
  
})