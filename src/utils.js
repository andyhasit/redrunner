const doc = document;


export class Wrapper {
  constructor(element, view) {
    this.e = element
    this._c = undefined // The viewCache, if any
    this._n = undefined //  
    this.view = view
  }
  
  // Methods which potentially change the containing view's nested views 
  append(item) {
    return this._append(item)
  }
  _append(item) {
    return this.e.appendChild(item.e)
  }
  child(item) {
    this.clear()
    return this._append(item)
  }
  replace(el) {
    this.e.parentNode.replaceChild(el, this.e)
  }
  clear() {
    if (this._n) {
      this._n.length = 0
    }
    this.e.innerHTML = ''
    this.e.textContent = ''
    this.e.value = ''
    return this
  }
  html(html) {
    this.e.innerHTML = html
    return this
  }
  inner(items) {
    /*
     * Use this for adding standard lists of items. Use items() is you used use()
     */
    if (!Array.isArray(items)) {
      return this.child(items)
    }
    this._prepRepeat()
    for (var i=0, il=items.length; i<il; i++) {
      this._append(items[i])
    }
    return this._done()
  }
  items(items) {
    this._prepRepeat()
    let view
    for (var i=0, il=items.length; i<il; i++) {
      view = this._c.getEl(items[i])
      this._nest(view)
      this.e.appendChild(view.root.e)
    }
    return this._done()
  }
  _nest(view) {
    //TODO: the idea of this it to keep track of nested views. Check it works...
    if (!this._n) {
      this._n = this.view.__nv
    }
    this._n.push(view)
  }
  _prepRepeat() {
    this.visible(false)
    this.clear()
  }
  _done() {
    this.visible(true)
    return this
  }
  use(cls) {
    this._c = new ViewCache(cls, this)
    return this
  }
  watch(desc, callback) {
    /*
     *   Watch a value and do something if it has changed.
     * 
     *   This method has two forms.
     * 
     *   If desc does not contain ":" then the callback is simply called if the value 
     *   changes (during the view's update() call)
     *
     *   The callback parameters are (newVal, oldVal, wrapper) 
     *   E.g.
     *
     *      h('div').watch('clickCount', (n,o,w) => w.text(n))
     *
     *   If the desc contains ":" (e.g. "text:clickCount") then we assume what is to 
     *   the left of : to be a method of the wrapper to call if the value has changed.
     *   E.g.
     *
     *       h('div').watch('text:clickCount')  // equates to wrapper.text(newValue)
     *   
     *   In this form, a callback may be provided to transform the value before it is
     *   used. Its parameters are (newVal, oldVal) 
     *   
     *    E.g.
     *
     *       h('div').watch('text:clickCount', (n,o) => `Click count is ${n}`)
     *   
     */
    let path, func, chunks = desc.split(':')
    if (chunks.length === 1) {
      path = chunks[0]
      func = (n,o) => callback(n,o,this)
    } else {
      let method = chunks[0]
      path = chunks[1]
      func = und(callback) ? n => this[method](n) : (n,o) => this[method](callback(n,o,this)) 
    }
    this.view.watch(path, func)
    return this
  }

  // These methods are mostly simple DOM wrappers

  get Value() {
    /* Returns the value of the element */
    return this.e.value
  }
  cls(style) {
    this.e.className = style
    return this
  }
  clsAdd(style) {
    this.e.classList.add(style)
    return this
  }
  clsAddTrans(style) {
    return this.transition(_ => this.e.classList.add(style))
  }
  clsRemove(style) {
    this.e.classList.remove(style)
    return this
  }
  clsRemoveTrans(style) {
    return this.transition(_ => this.e.classList.remove(style))
  }
  clsToggle(style) {
    this.e.classList.toggle(style)
    return this
  }
  att(name, value) {
    this.e.setAttribute(name, value)
    return this
  }
  atts(atts) {
    for (let name in atts) {
      this.att(name, atts[name])
    }
    return this
  }
  checked(value) {
    this.e.checked = value
    return this
  }
  href(value) {
    return this.att('href', value)
  }
  id(value) {
    return this.att('id', value)
  }
  src(value) {
    return this.att('src', value)
  }
  value(value) {
    return this.att('value', value)
  }
  text(value) {
    this.e.textContent = value
    return this
  }
  on(event, callback) {
    this.e.addEventListener(event, e => callback(e, this))
    return this
  }
  style(name, value) {
    this.e.style[name] = value
    return this
  }
  transition(fn) {
    return new Promise(resolve => {
      fn()
      let transitionEnded = e => {
        this.e.removeEventListener('transitionend', transitionEnded)
        resolve()
      }
    this.e.addEventListener('transitionend', transitionEnded)
    })
  }
  visible(visible) {
    return this.style('visibility', visible? 'visible' : 'hidden')
  }
}

export function getNode(elementOrId) {
  // We're assuming it starts with #
  let el = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)): elementOrId
  return el
}

/*
 * Mounts a view onto an element.
 */
export function mount(elementOrId, cls, props, parent, seq) {
  let view = createView(cls, parent, props, seq)
  let target = getNode(elementOrId)
  target.parentNode.replaceChild(view.root.e, target)
  return view
}


/* This function extracts properties from a target based on a path string
 *
 *   "app.items.length"
 *   "app.items().length"
 *
 * The path may include parentheses calls in which case the member is called.
 * The parentheses may not contain parameters.
 * It doesn't work for square brackets.
 */
const _red = (o,i)=> i.endsWith('()') ? o[i.substr(0, i.length -2)].bind(o)() : o[i]
export function getProp(target, path) {
  return path.split('.').reduce(_red, target)
}


export function und(x) {
  return x === undefined
}

export function isStr(x) {
  return typeof x === 'string'
}


/*
 * Creates the DOM element. Doesn't process inner.
 */

//
// I think this was an attempt to get round the issue of not being able to track
// nested_elements
//
// export function h(desc, inner) {
// 	let tag, rest, el, firstChar, label, ccsClass
// 	[tag, ...rest] = desc.trim().split(' ')
// 	el = document.createElement(tag)
// 	for (var i=0, il=rest.length; i<il; i++) {
// 		firstChar = i[0]
// 		if (firstChar == '#') {
// 			label = el.id = i.slice(1)
// 		} else if (firstChar == '#') {
// 			label = i.slice(1)
// 		} else {
// 			ccsClass = ccsClass? i : ccsClass += ' ' + i
// 		}
//   }
//   if (ccsClass) {
//   	el.setAttribute('class', ccsClass)
//   }
//   return {c: undefined, e: el, i: inner, l: label} // This is a nodeDef
// }

// TODO this is wrong-- is it?
// export function h(desc, inner) {
//   return new Wrapper(document.createElement(desc))
// }

// //TODO: do we need this?!
// export function c(cls, obj, label) {
// 	let newView = new cls(obj)
// 	newView.update()
// 	return {c: newView, e: undefined, i: undefined, l: label}
// }

/* Creates a wrapper from an HTML string. Does not mount it
 * Feels inefficent creating a throw away element 
 */
export function wrap(html) {
  let throwAway = document.createElement('template')
  throwAway.innerHTML = html
  return new Wrapper(throwAway.content.firstChild)
}

export function createView(cls, parent, props, seq) {
  let view = new cls(parent, props, seq)
  //(nest, bubble, el, s, seq, watch)
  //v.init(v.nest.bind(v), v.bubble.bind(v), v.el.bind(v), v, v.seq, v.watch.bind(v))
  // TODO restore the above
  // could even create the literal object here..?
  view.__bv(view, wrap)
  view.init()
  view.update()
  return view
}


export class ViewCache {
  constructor(cls, view, keyFn) {
    /*
    An object which caches and returns views of a same type.
    
    @cls -- any valid subclass of View
    @cacheBy -- either:
        <undefined> in which case the sequence is used as key*
        A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
        A function called with (props, seq) which must return a key
    */
    let defaultKeyFn = (props, seq) => seq
    this.view = view
    this.cls = cls
    this.cache = {}
    this.keyFn = keyFn || defaultKeyFn
    this._seq = 0
  }
  reset() {
    this._seq = 0
  }
  getEl(props) {
    /*
    Gets a view, potentially from cache
    */
    let view, key = this.keyFn(props, this._seq)
    if (this.cache.hasOwnProperty(key)) {
      view = this.cache[key]
    } else {
      view = createView(this.cls, this.view, props, this._seq)
      this.cache[key] = view
    }
    view.update(props)
    this._seq += 1
    return view
  }
}