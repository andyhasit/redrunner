
function ComponentTemplate(html, componentClass, watches) {
  this._html_ = html
  this._componentClass_ = componentClass
  this._watches_ = watches
}

let ct = ComponentTemplate.prototype

ct.cloneNode = function() {
  let ct = this._ct_
  if (!ct._template_) {
    let throwAway = document.createElement('template')
    // let tidy = raw.replace(/\n/g, "")
    //   .replace(/[\t ]+\</g, "<")
    //   .replace(/\>[\t ]+\</g, "><")
    //   .replace(/\>[\t ]+$/g, ">")
    throwAway.innerHTML = ct.html.trim()
    ct._template_ = throwAway.content.firstChild
  }
  return ct._template_.cloneNode(true)
}

ct.create = function (app, parent, obj, seq) {
  var node = this.cloneNode()
  var wrappers = this.extractWrappers(node)
  var component = new this.componentClass(this, node, wrappers)
  component.init(obj)
  return component
}

