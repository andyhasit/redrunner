class t{constructor(t){this.nextId=1,this.change=0,this.items=[],this.hash={},this.load(t)}add(t){return Promise.resolve(this._add(t))}_add(t){return t.id=this.nextId,this.nextId++,this.items.push(t),this.hash[t.id]=t,t}update(t,s){let e=this.hash[t];return Object.assign(e,s,{id:t}),Promise.resolve(e)}get(t){return this.hash[t]}getItems(){return this.items}delete(t){return this.items=this.items.filter(s=>s.id!==t),delete this.hash[t],Promise.resolve(t)}load(t){t.forEach(t=>this._add(t))}}export{t as Store};
//# sourceMappingURL=store.modern.js.map
