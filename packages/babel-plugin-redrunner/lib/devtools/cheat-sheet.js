
const cheatSheetEntries = [
    {
        section: 'Class methods',
        text: `You can use __html__ or __clone__ interchangeably, but __clone__ performs\
                     better for large lists due to how it builds the DOM.`,
        examples: [
            ['__html__', "The default. Each view's DOM will be built from scratch."],
            ['__clone__', "On first call the view will create a template, and clone it each time."],
        ]
    },
    {
        section: 'Inlines',
        text: `Inlines can be used in the text of attributes or the inner content between tags.\
                     e.g. <div class="alert {foo}">{foo|bar}</div>
                     You must specify one, or two slots separated by pipe, and surounded by curly braces.\
                     In all examples below foo and bar are expanded (e.g. "foo" becomes "this.props.foo"\
                     - see "Watching values" below for more details).`,
        examples: [
            ['{foo}', 'Watches foo for changes and uses its value'],
            ['{foo|bar}', 'Watches foo for changes but uses the value of bar'],
            ['{foo|bar()}', 'Watches foo but uses the return value of bar()'],
            ['{foo|bar?}', 'Watches foo but uses the return value of bar(new, old)'],
            ['{|bar}', 'Uses bar once, but never updates after'],
            ['{*|bar?}', 'Always update, calling bar each time'],
        ]
    },
    {
        section: 'Special Attributes',
        text: ``,
        examples: [
            [':as', ""],
            [':on', ""],
            [':nest', ""],
            [':watch', ""],
            [':wrapper', ""],
        ]
    },
    {
        section: 'Watching values',
        text: `This section applies to inlines and the special attributes "watch" and "nest".\
                   The syntax is "watchedValue|usedValue" but some attributes allow more slots.\
                   The expanding rules apply to both the watchedValue and the usedValue.\
                   You can leave slots blank, which does different things according to where.`,
        examples: [
            ['foo|', "Watches foo."],
            ['foo?|', ""],
        ]
    },
    {
        section: 'Expanding',
        text: `The watchedValue and the usedValue in inlines, the special attributes\
        "watch" and "nest", and some other places are "expanded".`,
        examples: [
            ['foo', "Means this.props.foo"],
            ['.foo', "Means this.foo"],
            ['..foo', "Means foo in the module scope"]
        ]
    },

]