import { createMarkdown2HtmlMetadata } from '../src/index'
import fs from 'fs'

let md = fs.readFileSync(__dirname+'/test.md','utf-8')

describe('transform', () => {
  let metadata = createMarkdown2HtmlMetadata(md)
  it('html',()=>{
    expect(metadata.html).toMatchSnapshot()
  })
  it('attributes',()=>{
    expect(metadata.attributes).toMatchSnapshot()
  })
  it('nestedHeaders',()=>{
    expect(metadata.nestedHeaders).toMatchSnapshot()
  })
})