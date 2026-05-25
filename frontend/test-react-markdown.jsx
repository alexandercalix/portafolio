import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { preserveMultipleNewlines } from './src/utils/markdownUtils.ts';

const text = "Line 1\n\n\n\nLine 2";

const html = renderToString(
  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
    {preserveMultipleNewlines(text)}
  </ReactMarkdown>
);

console.log(html);
