# Dev Notes

This doc contains notes for maintainers which don't belong in the main README.

### Directory structure

```
lib
  parse
    dom_walker
    inline_directives
    parse_config_directives
    parse_node
    view_templates
  generate
    code_generator
    statements
  utils
    babel
    dom
    misc
  constants.js
  config.js
  index.js
  node_data.js  
```

### Flow

The flow can be summarised as follows:

1. Babel traverses nodes in the syntax tree.
2. We provide babel with a "visitor" (defined in `index.js`) which detects if a class has RedRunner fields with HTML.
3. Those HTML fields are passed to a **CodeGenerator** (defined in `generate/code_generator`).
4. The **CodeGenerator** creates a **DomWalker** to traverse the HTML nodes, passing its own **processNode** function as the function to call on each node.
5. **processNode** calls **extractNodeData** which detects whether that node contains any:
   1. Inline directives
   2. Attribute directives (as determined by checking the names of attributes against directives defined in the **Config** object  (defined in `config.js`) 
6. If **extractNodeData** detects directives, it creates a **NodeData** object and:
   1. Adds instructions to it from the placeholders by calling methods on it.
   2. Lets directives do the same.
7. **extractNodeData** returns the **NodeData** object to **processNode**, 
8. **processNode** reads the data added by the directives, and adds the instructions in **CodeGenerator**.
9. Once all the HTML is processed, the **CodeGenerator** builds all the statements to be added to the code.
10. The visitor adds those statements (to the prototype of the class) and deletes the field with the HTML.

### Example output

This is an example of what comes out.

```javascript
// Just a variable to save space
var p = TestView.prototype;

// The stripped HTML
p.__ht = '<div>First Name:<span></span></div>';

// Initial properties for views nested with use:
p.__ip = {};

// The watch callbacks. 
// The args stand for:
// (wrapperKey, shieldQuery, reverseShield, shieldCount, callbacks)
p.__wc = [
  p.__wa('_1', 0, 0, 0, {
    'a': function(n, o, w, p, c) {
      w.text(n);
    }
  })
];

// The query cache
p.__qc = p.__lu({
  'a': function () {
    return this.props.firstName;
  }
});

// The build view function
p.__bv = function (view, prototype) {
  view.__bd(prototype);
  view.el = {
    '_1': view.__gw([1]),
  };
};
```

It can vary a lot, and may have changed since writing this. To check simply run `babel path/to/file.js` with the correct plugins in your `babel.config.js`.

### Watchers

The most delicate aspect of this is creating the watchers functionality. Watchers are created for inline directives, and several attribute directives (e.g. `:watch` and `:items`) add watches too.

#### Collating

We need to wait until all the watches for the view are collected, as we will be collating a couple of things.

##### Watched fields

There could be several directives watching the same field or function call. If the text in *slot 1* is the same, then the resulting query function will be the same, so it's simply a question of putting them all in one dictionary.

##### Callback lines

The watch callbacks may have multiple lines if multiple directives for the same element watch the same field. For example:

```html
<span class="{clickCount|getCss(n)}" :watch="clickCount|doStuff(w, n)">
  Hello {clickCount}
</span>
```

Will result in:

```javascript
 p.__wa('_1', 0, 0, 0, {
   'clickCount': function(n, o, w, p, c) {
      w.text('Hello ' + n).css(getCss(n));
      doStuff(w, n);
   }
})
```

Note that this is for directives which watch the same field. If directives watch different fields, there would be separate functions:

```javascript
 p.__wa('_1', 0, 0, 0, {
   'firstName': function(n, o, w, p, c) {
      w.text(n);
   },
   'age': function(n, o, w, p, c) {
      w.text(n);
   },
})
```

#### Inline directives

Inline directives are a bit special as they may need to steal adjacent text from the HTML.

```html
<span id="yo" class="alert-{style} bold">Hello {name}</span>
```

Becomes:

```javascript
p.__wc = [
  p.__wa('_1', 0, 0, 0, {
    'name': function(n, o, w, p, c) {
      w.text('Hello ' + n);
    }
  }),
  p.__wa('_1', 0, 0, 0, {
    'style': function(n, o, w, p, c) {
      w.css('alert-' + n + ' bold');
    }
  })
];
```

Note that the HTML will be stripped of text and attributes which contain directives:

```html
p.__ht = '<span id="yo"></span>';
```

If there are multiple directives operating on the same piece of text:

```html
<span>Hello {name}. It is {weekDay}</span>
```

Then we handle that differently:

```javascript
p.__wc = [
  p.__wa('_1', 0, 0, 0, {
    'name': function(n, o, w, p, c) {
      w.text(c.lookup('spanText').n);
    },
    'weekDay': function(n, o, w, p, c) {
      w.text(c.lookup('spanText').n);
    }
  })
];

// The query cache
p.__qc = p.__lu({
  'spanText': function(w, p, c) {
    return 'Hello ' + name + '. It is ' + weekDay;
  }
});
```

The resulting behaviours is that if either watched value changes, the element is updated. If neither change, nothing happens. Unfortunately if both change then the element is updated twice (but at least the spanText function is only called once, because that's how lookups work).

