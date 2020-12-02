import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = html`
    <div>
      The tile is {..tile}
      Author is <a>{..author}</a>
      Written in {..year}
      <span>
        <i>8</i>
      </span>
    </div>
  `
  
}

const props = {title: 'Flowers for Algernon', author: 'Daniel Keyes', year: 1958}
