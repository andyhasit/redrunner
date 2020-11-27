# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [0.8.5] - 2020-11-27

#### Added

* Callable watched fields now called with (props, view) 

### [0.8.4] - 2020-11-24

#### Fixed

* Fixed issue with setting value on wrapper

### [0.8.3] - 2020-11-23

#### Fixed

* Fixed issue with whitespace being stripped from HTML

### [0.8.1] - 2020-11-14

#### Fixed

* Set visibility on views (missing functionality)
* Refactored caches to improve performance

### [0.8.0] - 2020-11-10

#### Added

* :swap directive + instance cache
* Can place JS expressions inside directive converters

### [0.7.0] - 2020-11-07

#### Changed

* Inline delimiters now configurable and default to single curly braces.
* Directive `:as` is now called `:el`
* `view.dom` is now `view.el` 

#### Fixed

* Removed a spoiled child from oval office.

### [0.6.3] - 2020-11-02

#### Fixed

- Bubble now starts at parent, not self.

### [0.6.2] - 2020-11-02

#### Added

- Stubs automatically saved as their own name (e.g.`this.dom.inner`) enabling access to saved elements from parent view (e.g. `this.dom.inner.dom.form`)

### [0.6.1] - 2020-11-02

#### Added

- The bubble() method throws an error if it doesn't find a method.

#### Fixed

- Items added via `wrapper.items()` did not have parent set.

### [0.6.0] - 2020-11-01

#### Added

- The bubble() method.

#### Changed

- `h` no longer accepts second argument.
- Views automatically gets parent props

### [0.5.0] - 2020-10-29

#### Changed

- Nested class declarations are now `<use:ChildViewClass>` rather than uppercase convention: `<ChildViewClass ... >`
- Feature allowing you to place declarations inside a `views.html` file is currently disabled.
- Dropped [node-html-parser](https://github.com/taoqf/node-html-parser) and now use only [jsdom](https://github.com/jsdom/jsdom) for parsing HTML.

#### Fixed

- Horrible bug which injected the entire contenst of "he" (npm packge) into bundles, because of node-html-parser.

### [0.4.5] - 2020-10-27

#### Fixed

- Issue in nested views

### [0.4.4] - 2020-10-27

#### Fixed

- Bug with specifying props as function

### [0.4.2] - 2020-10-22

#### Fixed

- Issue with stubs constructor prototype

### [0.4.1] - 2020-10-21

#### Fixed

- Class properties were being removed from views which define \_\_html\_\_ or \_\_stubs\_\_.

### [0.4.0] - 2020-10-21

#### Added

- Stubs
- :replace

### [0.3.3] - 2020-10-18

#### Changed

- Froze node-html-parser @ 1.2.20 in babel plugin because 1.2.21 has major breaking change

### [0.3.2] - 2020-10-18

Botched release.

### [0.3.1] - 2020-08-18

#### Changed

- wrapper.visible now sets class hidden


## [0.3.0] - 2020-07-24

Major rewrite. Ignore anything before this.

