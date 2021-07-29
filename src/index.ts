import fm from 'front-matter'
import MarkdownIt, { Options as MarkdownOptions } from 'markdown-it'
import { parseDocument, DomUtils } from 'htmlparser2'
import { Element } from 'domhandler'
import { Plugin } from 'vite'
import renderDom from 'dom-serializer'

export type HItem = { level: number; title: string }
export interface NestedHItem extends HItem {
  children: NestedHItem[]
}

export type NestedHList = NestedHItem[]
export interface PluginOptions {
  markdownIt?: MarkdownOptions
}


export type Md2HtmlExports = {
  attributes: Record<string, any>;
  html: string;
  nestedHeaders: NestedHList
}
class ExportedContent {
  _exports: string[] = []
  _contextCode = ''

  addContext(contextCode: string): void {
    this._contextCode += `${contextCode}\n`
  }

  addExporting(exported: string): void {
    this._exports.push(exported)
  }

  export(): string {
    return [this._contextCode, `export { ${this._exports.join(', ')} }`].join('\n')
  }
}

/**
let hList = [ {level:1}, {level:2}, {level:3}, {level:2}, {level:3}, {level:1}, {level:4}]
let nestedHeaders = createNestedHList(hList); 
[
    {
        level: 1,
        children: [
            {
                level: 2,
                children: [{ level: 3 }]
            },
            {
                level: 2,
                children: [{ level: 3 }]
            }
        ]
    },
    { 
        level: 1, 
        children: [{ level: 4 }] 
    }
]
 */

export function createNestedHList(hList: HItem[]): NestedHList {
  if (!hList.length) return []

  // transform HItem to NestedHItem
  let nestedHeaders: NestedHItem[] = hList.map(h => {
    return {
      ...h,
      children: [],
    }
  })

  // create virtual rootHeader as root Header
  let rootHeader: NestedHItem = {
    level: 0,
    title: 'void',
    children: []
  }

  let prevHItem = rootHeader
  let visited: NestedHItem[] = [rootHeader]

  // search visited from end to start, to find closest parent
  const findClosestParent = (hItem: NestedHItem): NestedHItem => {
    for (let len = visited.length, i = len - 1; i >= 0; i--) {
      if (visited[i].level < hItem.level) {
        return visited[i]
      }
    }
    // add to elimilate ts error hint
    return visited[0]
  }

  nestedHeaders.forEach((curHItem) => {
    if (prevHItem.level < curHItem.level) {
      prevHItem.children.push(curHItem)
      prevHItem = curHItem
    } else if (prevHItem.level >= curHItem.level) {
      let closestParent: NestedHItem = findClosestParent(curHItem)
      closestParent.children.push(curHItem)
      prevHItem = curHItem
    }
    visited.push(curHItem)
  })

  return rootHeader.children
}

export function createMarkdown2HtmlMetadata(code: string, options: MarkdownOptions = { html: true }): Md2HtmlExports {
  let fmContent = fm<Record<string, any>>(code)
  const html = new MarkdownIt(options).render(fmContent.body)
  const rootDom = parseDocument(html)
  let hElements = rootDom.children.filter(
    rootSibling => rootSibling instanceof Element && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rootSibling.tagName)
  ) as Element[]

  let hList: HItem[] = []

  hElements.forEach(ele => {
    let hName = DomUtils.textContent(ele)
    ele.attribs['id'] = hName

    // inject hash link to blog content
    let newEle = new Element('a', { href: '#' + hName }, undefined)
    // DomUtils.appendChild(newEle,new Text('#'))
    DomUtils.prependChild(ele, newEle)

    hList.push({
      level: parseInt(ele.tagName.replace('h', '')),
      title: hName
    })
  })

  return {
    attributes: fmContent.attributes,
    html: renderDom(rootDom),
    nestedHeaders: createNestedHList(hList)
  }
}

function markdown2html(code: string, options: PluginOptions = {}) {
  let metadata = createMarkdown2HtmlMetadata(code, options.markdownIt || {})
  const content = new ExportedContent()
  content.addContext(`const attributes = ${JSON.stringify(metadata.attributes)}`)
  content.addExporting('attributes')

  // serialize injected hash html
  content.addContext(`const html = ${JSON.stringify(metadata.html)}`)
  content.addExporting('html')

  content.addContext(`const nestedHeaders = ${JSON.stringify(metadata.nestedHeaders)}`)
  content.addExporting('nestedHeaders')
  return content.export()
}

export const plugin = (options: PluginOptions = {}): Plugin => {
  return {
    name: 'vite-plugin-markdown2html',
    enforce: 'pre',
    transform(code:string, id:string) {
      if (!id.endsWith('.md')) return null
      return {
        code: markdown2html(code, options)
      }
    }
  }
}

export default plugin