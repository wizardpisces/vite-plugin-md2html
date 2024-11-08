# vite-plugin-md2html

A plugin to transfrom markdown to html in your vite project

* [Demo](https://wizardpisces.github.io/blog/Source-Map%E5%8E%9F%E7%90%86%E5%8F%8A%E5%85%B6%E5%BA%94%E7%94%A8)
* [Demo Project Path](https://github.com/wizardpisces/vite-site)
## Setup

Install

```bash
npm i -D vite-plugin-md2html # yarn add vite-plugin-md2html -D
```

Add it to `vite.config.js`

```ts
// vite.config.js
import md2HtmlPlugin from 'vite-plugin-md2html'

export default {
  plugins: [
    md2HtmlPlugin(options)
  ],
}
```

And import it in project

```ts
import {html} from './introduction.md'
```

Use in .vue

```html
<template>
  <p v-html="html"></p>
</template>

<script>
import {html} from './introduction.md'

export default {
 setup(){
   return {
     html
   }
 }
}
</script>
```

### options
```
markdownIt?: MarkdownIt.Options
```

#### Examples
```ts
// highlight code example

import md2HtmlPlugin from 'vite-plugin-md2html'
import hljs from 'highlight.js';
let options = {
    markdownIt: {
        html: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {}
            }

            return ''; // use external default escaping
        }
    }
}
export default {
  plugins: [
    md2HtmlPlugin(options)
  ],
}

```

### Other Meta data

[Nested header demo](https://wizardpisces.github.io/blog/vite%20%E7%AE%80%E4%BB%8B%E4%B8%8E%E5%8E%9F%E7%90%86)

```ts
import {nestedHeaders} from './introduction.md
```
```json
// nestedHeaders example
[
    {
        level: 1,
        title: "h1",
        children: [
            {
                level: 2,
                title: "h2",
                children: [{ 
                  level: 3,
                  title: "h3"
                }]
            },
            {
                level: 2,
                title: "h2",
                children: [{ 
                  level: 3 ,
                  title: "h3"
                }]
            }
        ]
    },
    { 
        level: 1, 
        title: "h1",
        children: [{ 
          level: 2 ,
          title: "h2"
        }] 
    }
]
```
