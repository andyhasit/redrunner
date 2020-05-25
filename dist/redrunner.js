var t=document,n=function(t){return void 0===t},e=function(t){return"string"==typeof t};function i(t){var n=document.createElement("template");return n.innerHTML=t,new o(n.content.firstChild)}function r(t,n,e,r){var s=new t(e,n,r);return s.__bv(s,i),s.init(),s.update(),s}var s=function(){function t(t,n,e){this.view=n,this.cls=t,this.cache={},this.keyFn=e||function(t,n){return n},this._seq=0}var n=t.prototype;return n.reset=function(){this._seq=0},n.get=function(t){var n,e=this.keyFn(t,this._seq);return this.cache.hasOwnProperty(e)?n=this.cache[e]:(n=r(this.cls,t,this.view,this._seq),this.cache[e]=n),n.update(t),this._seq+=1,n},t}(),o=function(){function t(t,n){this.e=t,this._c=void 0,this._n=void 0,this.view=n}var e,i=t.prototype;return i.append=function(t){return this._append(t)},i._append=function(t){return this.e.appendChild(t.e)},i.child=function(t){return this.clear(),this._append(t)},i.replace=function(t){this.e.parentNode.replaceChild(t,this.e)},i.clear=function(){return this._n&&(this._n.length=0),this.e.innerHTML="",this.e.textContent="",this.e.value="",this},i.html=function(t){return this.e.innerHTML=t,this},i.inner=function(t){if(!Array.isArray(t))return this.child(t);this._prepRepeat();for(var n=0,e=t.length;n<e;n++)this._append(t[n]);return this._done()},i.items=function(t){var n;this._prepRepeat();for(var e=0,i=t.length;e<i;e++)n=this._c.get(t[e]),this._nest(n),this.e.appendChild(n.root.e);return this._done()},i._nest=function(t){this._n||(this._n=this.view.__nv),this._n.push(t)},i._prepRepeat=function(){this.visible(!1),this.clear()},i._done=function(){return this.visible(!0),this},i.use=function(t){return this._c=new s(t,this),this},i.watch=function(t,e){var i,r,s=this,o=t.split(":");if(1===o.length)i=o[0],r=function(t,n){return e(t,n,s)};else{var u=o[0];i=o[1],r=n(e)?function(t){return s[u](t)}:function(t,n){return s[u](e(t,n,s))}}return this.view.watch(i,r),this},i.css=function(t){return this.e.className=t,this},i.cssAdd=function(t){return this.e.classList.add(t),this},i.cssAddTrans=function(t){var n=this;return this.transition(function(e){return n.e.classList.add(t)})},i.cssRemove=function(t){return this.e.classList.remove(t),this},i.cssRemoveTrans=function(t){var n=this;return this.transition(function(e){return n.e.classList.remove(t)})},i.cssToggle=function(t){return this.e.classList.toggle(t),this},i.att=function(t,n){return this.e.setAttribute(t,n),this},i.atts=function(t){for(var n in t)this.att(n,t[n]);return this},i.checked=function(t){return this.e.checked=t,this},i.href=function(t){return this.att("href",t)},i.id=function(t){return this.att("id",t)},i.src=function(t){return this.att("src",t)},i.value=function(t){return this.att("value",t)},i.text=function(t){return this.e.textContent=t,this},i.on=function(t,n){var e=this;return this.e.addEventListener(t,function(t){return n(t,e)}),this},i.style=function(t,n){return this.e.style[t]=n,this},i.transition=function(t){var n=this;return new Promise(function(e){t(),n.e.addEventListener("transitionend",function t(i){n.e.removeEventListener("transitionend",t),e()})})},i.visible=function(t){return this.style("visibility",t?"visible":"hidden")},(e=[{key:"Value",get:function(){return this.e.value}}])&&function(t,n){for(var e=0;e<n.length;e++){var i=n[e];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}(t.prototype,e),t}(),u=function(){function t(t,n,e){this.__html__="<div/>";var i=this;i.parent=t,i.props=n,i.seq=e,i.__nv=[],i.__ov={},i.root=null,i.dom=null}var e=t.prototype;return e.init=function(){},e.update=function(t){n(t)||(this.props=t),this.__uw(),this.__un()},e.debug=function(){c.log(this.__bv.toString());var t=[];t.push("__wc: {");for(var n=0,e=Object.entries(this.__wc);n<e.length;n++){var i=e[n],r=i[1];t.push('  "'+i[0]+'": ['),r.forEach(function(n){return t.push("  "+n.toString())}),t.push("  ]")}t.push("}"),c.log(t.join("\n"))},e.nest=function(t,n,e){var i=r(t,n,this,e);return this.__nv.push(i),i},e.emit=function(t,e){for(var i=this;!n(i);){var r=i._handlers_;if(t in r)return r[t].apply(i,e);i=i.parent}},e.old=function(t){return this.__ov[t]},e.watch=function(t,n){return this.__wc.hasOwnProperty(t)||(this.__wc[t]=[]),this.__wc[t].push(n),this},e.__gw=function(t){var n=t.reduce(function(t,n){return t.childNodes[n]},this.root.e);return new o(n,this)},e.__un=function(){this.__nv.forEach(function(t){t.__ia()&&t.update()})},e.__uw=function(){var t,n,e,i;for(t in this.__wc){if(n=this.__wq[t].apply(this),e=this.__ov[t],""===t||e!==n)for(var r=0,s=(i=this.__wc[t]).length;r<s;r++)i[r].apply(this,[n,e]);this.__ov[t]=n}},e.__rn=function(t,n){this.__gw(t).replace(n.root.e)},e.__ia=function(){return this.root.e.parentNode},t}(),h=function(t){return 1},a=function(t){var n,e;function i(){return t.apply(this,arguments)||this}e=t,(n=i).prototype=Object.create(e.prototype),n.prototype.constructor=n,n.__proto__=e;var r=i.prototype;return r.init=function(){var t=this,n=this.props,e=n.resources;if(this._routes=n.routes.map(function(t){return new f(t)}),this._resources={},e)for(var i=0,r=Object.entries(e);i<r.length;i++){var s=r[i];this._resources[s[0]]={loaded:!1,func:s[1]}}window.addEventListener("hashchange",function(n){return t._hashChanged()}),window.addEventListener("load",function(n){return t._hashChanged()})},r._resolveResources=function(t){var n=this,e=[];return t&&t.forEach(function(t){var i=n._resources[t];i.loaded||e.push(i.func(n))}),Promise.all(e)},r._hashChanged=function(){var t=location.hash.slice(1)||"/";this._matchRoute(t)},r._matchRoute=function(t){for(var n=this,e=this._routes.length,i=!1,r=function(e){var r=n._routes[e],s=r.match(t);if(s)return i=!0,n._resolveResources(r.resources).then(function(t){r.getView(s).then(function(t){n.root.child(t.root)})}),"break"},s=0;s<e&&"break"!==r(s);s++);if(!i)throw new Error("Route not matched: "+t)},i}(u),f=function(){function t(t){this.resources=t.resources;var n,e=t.path;this._vc=new s(t.cls,this,t.keyFn||h);var i=e.split("?");n=i[1],this.chunks=this.buildChunks(e=i[0]),this.params=this.buildParams(n),this.resolve=t.resolve||this.defautResolve}var n=t.prototype;return n.defautResolve=function(t){return Promise.resolve(t)},n.buildChunks=function(t){return t.split("/").map(function(t){return t.startsWith("{")?new l(t.slice(1,-1)):t})},n.buildParams=function(t){var n={};return t&&t.split(",").forEach(function(t){var e=new l(t.trim());n[e.name]=e}),n},n.getView=function(t){var n=this;return this.resolve(t,this).then(function(t){return n._vc.get(t)})},n.match=function(t){var n,i,r=this,s=this.chunks.length,o={},u=t.split("?");n=u[0],i=u.slice(1);var h=n.split("/");if(s!==h.length)return!1;for(var c=function(t){var n=r.chunks[t],i=h[t];if(n instanceof l)o[n.name]=function(t){return n.convert(i)};else if(e(n)&&n!=i)return{v:!1}},a=0;a<s;a++){var f=c(a);if("object"==typeof f)return f.v}for(var v in o)o[v]=o[v]();var p={};return i&&i.join("").split("&").forEach(function(t){var n,e,i=t.split("=");e=i[1],p[n=i[0]]=r.params.hasOwnProperty(n)?r.params[n].convert(e):e}),{args:o,params:p,url:t}},t}(),l=function(){function t(t){var n,e=t.split(":");switch(n=e[1],this.name=e[0],n){case"int":this.conv=function(t){return parseInt(t)};break;case"float":this.conv=function(t){return parseFloat(t)};break;default:this.conv=function(t){return t}}}return t.prototype.convert=function(t){return this.conv(t)},t}();module.exports={mount:function(n,i,s,o,u){var h=r(i,s,o,u),c=e(n)?t.getElementById(n.slice(1)):n;return c.parentNode.replaceChild(h.root.e,c),h},h:function(t,n){return new o(document.createElement(t)).inner(n)},Router:a,Store:function(){function t(t){this.nextId=1,this.change=0,this.items=[],this.hash={},this.load(t)}var n=t.prototype;return n.add=function(t){return Promise.resolve(this._add(t))},n._add=function(t){return t.id=this.nextId,this.nextId++,this.items.push(t),this.hash[t.id]=t,t},n.update=function(t,n){var e=this.hash[t];return Object.assign(e,n,{id:t}),Promise.resolve(e)},n.get=function(t){return this.hash[t]},n.getItems=function(){return this.items},n.delete=function(t){return this.items=this.items.filter(function(n){return n.id!==t}),delete this.hash[t],Promise.resolve(t)},n.load=function(t){var n=this;t.forEach(function(t){return n._add(t)})},t}(),View:u,ViewCache:s,wrap:i};
//# sourceMappingURL=redrunner.js.map
