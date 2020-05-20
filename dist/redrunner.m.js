var t=document,n=function(t){return void 0===t};function i(t){var n=document.createElement("template");return n.innerHTML=t,new s(n.content.firstChild)}function e(t,n,e,r){var s=new t(e,n,r);return s.__bv(s,i),s.init(),s.update(),s}var r=function(){function t(t,n,i){this.view=n,this.cls=t,this.cache={},this.keyFn=i||function(t,n){return n},this._seq=0}var n=t.prototype;return n.reset=function(){this._seq=0},n.get=function(t){var n,i=this.keyFn(t,this._seq);return this.cache.hasOwnProperty(i)?n=this.cache[i]:(n=e(this.cls,t,this.view,this._seq),this.cache[i]=n),n.update(t),this._seq+=1,n},t}(),s=function(){function t(t,n){this.e=t,this._c=void 0,this._n=void 0,this.view=n}var i,e=t.prototype;return e.append=function(t){return this._append(t)},e._append=function(t){return this.e.appendChild(t.e)},e.child=function(t){return this.clear(),this._append(t)},e.replace=function(t){this.e.parentNode.replaceChild(t,this.e)},e.clear=function(){return this._n&&(this._n.length=0),this.e.innerHTML="",this.e.textContent="",this.e.value="",this},e.html=function(t){return this.e.innerHTML=t,this},e.inner=function(t){if(!Array.isArray(t))return this.child(t);this._prepRepeat();for(var n=0,i=t.length;n<i;n++)this._append(t[n]);return this._done()},e.items=function(t){var n;this._prepRepeat();for(var i=0,e=t.length;i<e;i++)n=this._c.get(t[i]),this._nest(n),this.e.appendChild(n.root.e);return this._done()},e._nest=function(t){this._n||(this._n=this.view.__nv),this._n.push(t)},e._prepRepeat=function(){this.visible(!1),this.clear()},e._done=function(){return this.visible(!0),this},e.use=function(t){return this._c=new r(t,this),this},e.watch=function(t,i){var e,r,s=this,h=t.split(":");if(1===h.length)e=h[0],r=function(t,n){return i(t,n,s)};else{var u=h[0];e=h[1],r=n(i)?function(t){return s[u](t)}:function(t,n){return s[u](i(t,n,s))}}return this.view.watch(e,r),this},e.css=function(t){return this.e.className=t,this},e.cssAdd=function(t){return this.e.classList.add(t),this},e.cssAddTrans=function(t){var n=this;return this.transition(function(i){return n.e.classList.add(t)})},e.cssRemove=function(t){return this.e.classList.remove(t),this},e.cssRemoveTrans=function(t){var n=this;return this.transition(function(i){return n.e.classList.remove(t)})},e.cssToggle=function(t){return this.e.classList.toggle(t),this},e.att=function(t,n){return this.e.setAttribute(t,n),this},e.atts=function(t){for(var n in t)this.att(n,t[n]);return this},e.checked=function(t){return this.e.checked=t,this},e.href=function(t){return this.att("href",t)},e.id=function(t){return this.att("id",t)},e.src=function(t){return this.att("src",t)},e.value=function(t){return this.att("value",t)},e.text=function(t){return this.e.textContent=t,this},e.on=function(t,n){var i=this;return this.e.addEventListener(t,function(t){return n(t,i)}),this},e.style=function(t,n){return this.e.style[t]=n,this},e.transition=function(t){var n=this;return new Promise(function(i){t(),n.e.addEventListener("transitionend",function t(e){n.e.removeEventListener("transitionend",t),i()})})},e.visible=function(t){return this.style("visibility",t?"visible":"hidden")},(i=[{key:"Value",get:function(){return this.e.value}}])&&function(t,n){for(var i=0;i<n.length;i++){var e=n[i];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(t,e.key,e)}}(t.prototype,i),t}();module.exports={View:function(){function t(t,n,i){this.__html__="<div/>";var e=this;e.parent=t,e.props=n,e.seq=i,e.__nv=[],e.__ov={},e.root=null,e.dom=null}var i=t.prototype;return i.init=function(){},i.update=function(t){n(t)||(this.props=t),this.__uw(),this.__un()},i.debug=function(){c.log(this.__bv.toString());var t=[];t.push("__wc: {");for(var n=0,i=Object.entries(this.__wc);n<i.length;n++){var e=i[n],r=e[1];t.push('  "'+e[0]+'": ['),r.forEach(function(n){return t.push("  "+n.toString())}),t.push("  ]")}t.push("}"),c.log(t.join("\n"))},i.nest=function(t,n,i){var r=e(t,n,this,i);return this.__nv.push(r),r},i.emit=function(t,i){for(var e=this;!n(e);){var r=e._handlers_;if(t in r)return r[t].apply(e,i);e=e.parent}},i.watch=function(t,n){return this.__wc.hasOwnProperty(t)||(this.__wc[t]=[]),this.__wc[t].push(n),this},i.__gw=function(t){var n=t.reduce(function(t,n){return t.childNodes[n]},this.root.e);return new s(n,this)},i.__un=function(){this.__nv.forEach(function(t){t.__ia()&&t.update()})},i.__uw=function(){var t,n,i,e;for(t in this.__wc){if(n=this.__wq[t].apply(this),i=this.__ov[t],""===t||i!==n)for(var r=0,s=(e=this.__wc[t]).length;r<s;r++)e[r].apply(this,[n,i]);this.__ov[t]=n}},i.__rn=function(t,n){this.__gw(t).replace(n.root.e)},i.__ia=function(){return this.root.e.parentNode},t}(),mount:function(n,i,r,s,h){var u=e(i,r,s,h),o="string"==typeof n?t.getElementById(n.slice(1)):n;return o.parentNode.replaceChild(u.root.e,o),u}};
//# sourceMappingURL=redrunner.m.js.map
