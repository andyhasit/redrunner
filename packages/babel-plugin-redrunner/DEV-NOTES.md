# Dev Notes

This doc contains notes for maintainers which don't belong in the main README.

### Directory Structure

```
lib
  parse
    dom_walker
    inline_directives
    parse_directives
    parse_node
    view_templates
  generate
    code_generator
    statements
  utils
    babel
    constants
    dom
    misc
  node_data.js
  index.js
  config.js
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

##### Watches:

Watches can come from inline or attribute directives. We wait until all of the component's watches are collected before building their statements as they are grouped.

### Still to implement:

Doesn't handle multiple inline directives in the same text:

```html
<div>
    I ate {quantity|round2pd} {foodItems|captialise} today.
</div>
```

Doesn't handle inline directives if it is not a leaf node:

```html
<div>
    I ate {quantity|round2pd} {foodItems|captialise} today.
    <span>It was yummy.</span>
</div>
```

