const c = console;
import {App, Component} from '../../src/redrunner'


class Main extends Component {
  _html_ = `
    <div>
      <span>0</span>                       <<< count
      <a class="button">Click me</a>       <<< btn
    </div>
  `
  
}

const app = new App()
app.mount(Main, '#main')
