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
    // Maybe use emit?

  }
}


export class SmoothieForm extends View {
  __html__ = `
    <form class="form-example">
      <FormLine :props=".nameField"/>
      <FormLine :props=".costField"/>
      <button class="button" type="button" :onClick=".clickSave">Save</button>
    </form>
  `
  init() {
    this.nameField = {name: 'name', caption: 'Name', type: 'text'}
    this.costField = {name: 'cost', caption: 'Cost', type: 'text'}
  }
  update() {
    this.formData = {
      name: '',
      cost: 0
    }
  }
  clickSave(e, w) {
    c.log(e)
  }
}