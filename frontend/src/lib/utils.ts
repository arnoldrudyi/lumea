import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { remark } from 'remark';
import html from 'remark-html';
import { rehype } from 'rehype';
import rehypeKatex from 'rehype-katex'
import remarkGFM from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeAddClasses from 'rehype-add-classes';
import rehypeHighlight from 'rehype-highlight';
import rehypeHighlightCodeLines from 'rehype-highlight-code-lines';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const remarkResult = await remark()
    .use(remarkGFM)
    .use(remarkMath)
    .use(html)
    .process(markdown);

  const htmlWithClasses = await rehype()
    .data('settings', { fragment: true })
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeHighlightCodeLines, {
      showLineNumbers: true,
      lineContainerTagName: 'div',
    })
    .use(rehypeKatex)
    .use(rehypeAddClasses, {
      table: 'border-collapse w-fit overflow-scroll',
      th: 'border border-border p-1 bg-gray-100',
      td: 'border border-border p-2 bg-background',
      h1: 'text-3xl font-bold my-4',
      h2: 'text-xl font-bold mt-10 mb-4',
      p: 'my-2',
      a: 'underline',
      ul: 'list-disc ml-5',
      ol: 'list-decimal ml-5',
      blockquote: 'border-l-4 border-gray-300 pl-4 italic',
      code: 'rounded px-1.5 py-1',
      pre: 'bg-gray-900 text-white rounded p-4 overflow-x-auto',
    })
    .use(rehypeStringify)
    .process(remarkResult);

  return htmlWithClasses.toString();
}