/*

These test are breaking as I explore a new way of making it work.
Make this a hide & show. Use cached objects too.
Also reverse, and same element.

*/


import {c, h, load, View} from '../utils'

class TestView extends View {
  __html__ = `
    <div>
      <div :show="show">
        <div :watch="*|.getContents?|inner"></div>
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


test("Inner contents update", () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
      <div style="visibility: visible;">
        <div>
    	    <div>1</div>
          <div>2</div>
          <div>3</div>
        </div>
      </div>
    </div>
  `)
  // props.show = false
  // div.update()
  // expect(div).toShow(`
  //   <div>
  //     <div style="visibility: hidden;">
  //       <div>
  //         <div>1</div>
  //         <div>2</div>
  //         <div>3</div>
  //       </div>
  //     </div>
  //   </div>
  // `)
  // props.items = [4, 5]
  // div.update()

  // // Nothing should change
  // expect(div).toShow(`
  //   <div>
  //     <div style="visibility: hidden;">
  //       <div>
  //         <div>1</div>
  //         <div>2</div>
  //         <div>3</div>
  //       </div>
  //     </div>
  //   </div>
  // `)

  // props.show = true
  // div.update()
  // //
  // expect(div).toShow(`
  //   <div>
  //     <div style="visibility: visible;">
  //       <div>
  //         <div>4</div>
  //         <div>5</div>
  //       </div>
  //     </div>
  //   </div>
  // `)
})
