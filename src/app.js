import {mount} from './utils'
import {createComponent} from './component'


export class App {
  /* The root object which you mount top level components to */
  constructor(props) {
    this._nested_ = []
    this._paths_ = {}
    Object.assign(this, props)
  }

  /* Mounts a top level component and builds it instantly.
   *
   * @param {class} componentClass - The class of the component.
   * @param {idEl} id or element to wrap
   * @param {obj} optional, gets passed to component constructor
   */
  mount(componentClass, idEl, obj) {
    let component = createComponent(componentClass, this, this, obj, 0)
    mount(component, idEl)
    this._nested_.push(component)
  }
    
  /*
   * Propagates the update call to all nested components 
   */
  update() {
    // requestAnimationFrame(() => {
    // })
      this._nested_.forEach(v => v.update())
  }
}