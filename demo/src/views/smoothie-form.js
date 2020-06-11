import {View} from 'redrunner'
import {fruitService} from '../services/fruit'
import {smoothiesService} from '../services/smoothies'


class FormLine extends View {
  __html__ = `
    <div class="form-field">
      <label for="{{name}}">{{caption}}: </label>
      <input type="{{type}}" name="{{name}}" :onKeyUp=".changed" required>
    </div>
  `
  changed(e, w) {
    c.log(w.getValue())
    // Maybe us emit?

  }
}

const nameField = {name: 'name', caption:'Smoothie name', type: 'text'}

export class SmoothieForm extends View {
  __html__ = `
    <form class="form-example">
      <FormLine :props="..nameField"/>
      <button class="button" type="button" onClick=".clickSave">Save</button>
    </form>
  `
  init() {
    this.nameField = {name: 'name', caption:'Smoothie name', type: 'text'}
  }
  clickSave(e, w) {

  }
}