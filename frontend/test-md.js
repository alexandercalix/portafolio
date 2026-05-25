const { unified } = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeStringify = require('rehype-stringify');
const remarkBreaks = require('remark-breaks');

const text = "Line 1\n\n\n\nLine 2";

const file = unified()
  .use(remarkParse)
  .use(remarkBreaks)
  .use(remarkRehype)
  .use(rehypeStringify)
  .processSync(text);

console.log(String(file));
