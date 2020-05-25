
export class Store {
  constructor(items) {
    this.nextId = 1
    this.changed = 0
    this.items = []
    this.hash = {}
    this.load(items)
  }
  add(item) {
    this.changed
    return Promise.resolve(this._add(item))
  }
  _add(item) {
    item.id = this.nextId
    this.nextId ++
    this.items.push(item)
    this.hash[item.id] = item
    return item
  }
  update(id, item) {
    let target = this.hash[id]
    Object.assign(target, item, {id: id})
    this.changed
    return Promise.resolve(target)
  }
  get(id) {
    return this.hash[id]
  }
  getItems() {
    return this.items
  }
  delete(id) {  
    this.items = this.items.filter(item => item.id !== id)
    delete this.hash[id]
    this.changed
    return Promise.resolve(id)
  }
  load(items) {
    items.forEach(item => this._add(item))
  }
}
