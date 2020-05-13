import {mount} from './utils'


/* The central object which glues together the top level components.
 */
export class App {
  constructor(props) {
    this._nested_ = []
    Object.assign(this, props)
  }

  /* Mounts a top level component and builds it instantly.
   *
   * @param {elementOrId} The id (e.g. "#main") or a DOM element
   * @param {cls} The class of the component.
   * @param {props} Optional, gets passed to component constructor
   */
  mount(elementOrId, cls, props) {
    this._nested_.push(mount(elementOrId, cls, props, this, this, 0))
  }
    
  /*
   * Propagates the update call to all nested components 
   */
  update() {
    // requestAnimationFrame(() => {
      this._nested_.forEach(v => v.update())
    // })
  }
}