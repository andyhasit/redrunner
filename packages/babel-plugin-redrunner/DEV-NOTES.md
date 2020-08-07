# DEV NOTES

Notes that don't belong in the main README.

### Code Organisation

The logic of building up the final JavaScript is spread between the statement builder, the view parser and the node parser.

### Why prototype methods?

Transforming ES6 code to ES6 code:

```javascript
// BEFORE
class A() {
  __html__ = '<div></div>'
}
// AFTER
class A() {
  build() {...}
}
```
Was really tricky. Babel just doesn't play well with that idea, but adding to a prototype works:

```javascript
class A() {
  ...
}
A.prototype.build = function () {...}
```

### 

