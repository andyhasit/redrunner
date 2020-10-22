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

### Flow

index.js will traverse the AST, and call different bits depending on what it finds:

```
__html__   >>   view_statement_builder.ViewStatementBuilder().buildStatements(viewData)
__clone__  >>   view_statement_builder.ViewStatementBuilder().buildStatements(viewData)
__stubs__  >>   code directly in index.js then as per __html__ for each stub.
view.html  >>   view_templates.viewTemplates.getHtml()
```

Using the returned data, it adds statements to the ES5 output.

the `ViewStatementBuilder` does:

1. Sets up objects which will be used to collect infor and eventually create the statements
2. Creates a DomWalker passing it ViewStatementBuilder's processNode method
3. Return the list of statements to add to the file

The `DomWalker` traverses the HTML nodes in the string, calling `processNode(nodeInfo)` for every node.

The `processNode()` calls `extractNodeData()` and uses the data to build statements.

The `extractNodeData()` creates a `NodeData` instance, and asks it to process directives and inline watches. It deals with removing parts of the DOM we don't need.




```
vsb = ViewStatementBuilder()
```
DomWalker

